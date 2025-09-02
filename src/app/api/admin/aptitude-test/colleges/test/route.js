import { NextResponse } from "next/server";
import CollegeModel from "../../../../../../../models/AptitudeTest/College.model";
import TestModel from "../../../../../../../models/AptitudeTest/Test.model";
import _db from "../../../../../../../utils/db";
import { authMiddleware } from "../../../../../../../middlewares/auth";
import { generateTestLink } from "../../../../../../../utils/AptitudeTest/generateTestLink";
import { BASE_URL } from "config/config";
import TestSessionModel from "../../../../../../../models/AptitudeTest/TestSession.model";

await _db();

export const POST = authMiddleware(
  async function (request) {
    try {
      const { collegeId, batchName, testDuration, testSettings, startDateTime, endDateTime } = await request.json();

      if (!testDuration || !batchName || !testSettings.questionsPerTest || !testSettings.passingScore) {
        return NextResponse.json(
          {
            success: false,
            message: "Test duration, batch name, questions per test, and passing score are required",
          },
          { status: 400 }
        );
      }

      if (!startDateTime || !endDateTime) {
        return NextResponse.json(
          {
            success: false,
            message: "Start time and end time are required",
          },
          { status: 400 }
        );
      }

      const startTime = new Date(startDateTime);
      const endTime = new Date(endDateTime);

      if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid date/time format",
          },
          { status: 400 }
        );
      }

      if (endTime <= startTime) {
        return NextResponse.json(
          {
            success: false,
            message: "End time must be after start time",
          },
          { status: 400 }
        );
      }

      const college = await CollegeModel.findById(collegeId);
      if (!college) {
        return NextResponse.json(
          { success: false, message: "College not found" },
          { status: 404 }
        );
      }

      const testId = generateTestLink();
      const test = new TestModel({
        testId,
        batchName,
        college: collegeId,
        testDuration,
        testSettings,
        hasExpiry: startTime !== null && endTime !== null,
        startTime: startTime || null,
        endTime: endTime || null,
      });
      await test.save();

      college.testIds.push(testId);
      college.testLink = `${BASE_URL}/aptitude-test?testId=${testId}&collegeId=${collegeId}&batchName=${batchName}`;
      await college.save();

      const testData = {
        success: true,
        message: "Test created successfully",
        data: {
          testId,
          testLink: `/aptitude-test?testId=${testId}&collegeId=${collegeId}&batchName=${batchName}`,
          hasExpiry: test.hasExpiry,
          startTime: test.startTime,
          endTime: test.endTime
        },
      };
      
      return NextResponse.json(testData);
    } catch (error) {
      console.error("Test creation error:", error);
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }
  },
  ["admin"]
);

// GET and DELETE routes remain unchanged
export const GET = authMiddleware(
  async function (request) {
    try {
      const { searchParams } = new URL(request.url);
      const collegeId = searchParams.get("collegeId");
      const currentDate = new Date();

      const query = collegeId ? { college: collegeId } : {};
      const tests = await TestModel.find({}).lean().exec();

      return NextResponse.json({
        success: true,
        message: "Tests fetched successfully",
        data: tests.map((test) => {
          const testData = {
            ...test,
            testLink: `${BASE_URL}/aptitude-test?testId=${test.testId}&collegeId=${test.college}&batchName=${test.batchName}`,
            status: "active", // default status
          };

          if (test.hasExpiry) {
            const startTime = new Date(test.startTime);
            const endTime = new Date(test.endTime);

            if (currentDate < startTime) {
              testData.status = "scheduled";
              testData.statusMessage = `Starts at ${startTime.toLocaleString()}`;
            } else if (currentDate > endTime) {
              testData.status = "expired";
              testData.statusMessage = `Expired on ${endTime.toLocaleString()}`;
            } else {
              testData.status = "active";
              testData.statusMessage = `Ends at ${endTime.toLocaleString()}`;
            }
          }

          return testData;
        }),
      });
    } catch (error) {
      console.error("Fetch tests error:", error);
      return NextResponse.json(
        { success: false, message: "Something went wrong" },
        { status: 500 }
      );
    }
  },
  ["admin"]
);

export const DELETE = authMiddleware(
  async function (request) {
    try {
      const { searchParams } = new URL(request.url);
      const testId = searchParams.get("testId");
      const collegeId = searchParams.get("collegeId");

      if (!testId || !collegeId) {
        return NextResponse.json(
          { success: false, message: "Test ID and college ID are required" },
          { status: 400 }
        );
      }

      const test = await TestModel.findOneAndDelete({ testId, college: collegeId });
      if (!test) {
        return NextResponse.json(
          { success: false, message: "Test not found" },
          { status: 404 }
        );
      }

      await CollegeModel.findByIdAndUpdate(collegeId, { $pull: { testIds: testId } });
      await TestSessionModel.deleteMany({ testId, college: collegeId });

      return NextResponse.json({
        success: true,
        message: "Test and associated sessions deleted successfully",
      });
    } catch (error) {
      console.error("Delete test error:", error);
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }
  },
  ["admin"]
);