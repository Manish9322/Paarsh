import { NextResponse } from 'next/server';
import { authMiddleware } from '../../../../../../../middlewares/auth';
import Test from '../../../../../../../models/AptitudeTest/Test.model';
import _db from '../../../../../../../utils/db';

await _db();

export const GET = authMiddleware(async function(request) {
  try {
    const { searchParams } = new URL(request.url);
    const collegeId = searchParams.get("collegeId");

    if (!collegeId) {
      return NextResponse.json(
        { success: false, message: "College ID is required" },
        { status: 400 }
      );
    }

    // Get unique batch names for the college
    const batches = await Test.distinct('batchName', { college: collegeId });
    
    return NextResponse.json({ 
      success: true, 
      batches: batches.sort() // Sort alphabetically
    });
  } catch (error) {
    console.error("Error fetching batches:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}, ["admin"]); 