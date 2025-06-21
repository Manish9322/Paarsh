import { NextResponse } from "next/server";
import { authMiddleware } from "../../../../../../middlewares/auth";
import SaleModel from "models/AgentSale.model";
import TargetModel from "models/AgentTarget.model";
import AgentModel from "models/Agent.model";
import _db from "../../../../../../utils/db";

_db();

export const GET = authMiddleware(async (request) => {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get("agentId");

    const agent = await AgentModel.findById(agentId);

    if (!agent) {
      return NextResponse.json(
        { success: false, error: "Agent not found" },
        { status: 404 }
      );
    }

    // Fetch all sales for this agent
    const allSales = await SaleModel.find({
      agentId: agentId,
    })
      .populate("agentId", "firstName lastName email agentCode")
      .populate("targetId", "targetAmount targetCount startDate endDate status targetType")
      .sort({ saleDate: -1 }); // Sort by most recent sales first

    // Get current active targets for the agent
    const activeTargets = await TargetModel.find({
      agentId: agentId,
      status: "active",
    });

    // Calculate sales summary
    const totalAmount = allSales.reduce((sum, sale) => sum + sale.amount, 0);
    const totalCount = allSales.length;

    // Get sales for current month
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const monthlySales = allSales.filter(sale => 
      sale.saleDate >= startOfMonth && sale.saleDate <= endOfMonth
    );

    const monthlyAmount = monthlySales.reduce((sum, sale) => sum + sale.amount, 0);
    const monthlyCount = monthlySales.length;

    // Get sales for current year
    const startOfYear = new Date(currentDate.getFullYear(), 0, 1);
    const yearlySales = allSales.filter(sale => sale.saleDate >= startOfYear);
    const yearlyAmount = yearlySales.reduce((sum, sale) => sum + sale.amount, 0);
    const yearlyCount = yearlySales.length;

    return NextResponse.json({
      success: true,
      message: "Agent sales fetched successfully",
      data: {
        agent: {
          id: agent._id,
          name: `${agent.firstName} ${agent.lastName}`,
          email: agent.email,
          agentCode: agent.agentCode,
          totalSale: agent.totalSale,
          countSale: agent.countSale,
        },
        sales: {
          all: allSales,
          monthly: monthlySales,
          yearly: yearlySales,
        },
        summary: {
          total: {
            amount: totalAmount,
            count: totalCount,
          },
          monthly: {
            amount: monthlyAmount,
            count: monthlyCount,
          },
          yearly: {
            amount: yearlyAmount,
            count: yearlyCount,
          },
        },
        activeTargets,
        // Target progress for active targets
        targetProgress: activeTargets.map(target => ({
          targetId: target._id,
          targetType: target.targetType,
          targetAmount: target.targetAmount,
          targetCount: target.targetCount,
          achievedAmount: target.achievedAmount,
          achievedCount: target.achievedCount,
          amountProgress: target.targetAmount > 0 ? (target.achievedAmount / target.targetAmount * 100).toFixed(2) : 0,
          countProgress: target.targetCount > 0 ? (target.achievedCount / target.targetCount * 100).toFixed(2) : 0,
          startDate: target.startDate,
          endDate: target.endDate,
          status: target.status,
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching agent sales:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}, ["admin"]);