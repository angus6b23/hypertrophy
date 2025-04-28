import { handleError } from "@/utils/handleError";
import {
  clearPlan,
  deletePlan,
  getPlanDetails,
  getPlanOnwer,
  getPublicPlans,
  getUserPlan,
  insertPlanPayload,
} from "@/utils/plans";
import { NextRequest, NextResponse } from "next/server";
import {
  AuthErrors,
  CustomError,
  PathErrors,
} from "share/interfaces/error-codes";
import { Plan } from "share/interfaces/Workout";

export const getPlansController = async (req: NextRequest) => {
  try {
    const ownerId = req.headers.get("x-user-id")!;
    const url = new URL(req.nextUrl);
    const queries = url.searchParams;
    if (queries.get("public")) {
      const cursor = Number(queries.get("page")) || 0;
      const plans = await getPublicPlans(cursor);
      return NextResponse.json({ status: "success", data: plans });
    } else {
      const plans = await getUserPlan(ownerId);
      return NextResponse.json({ status: "success", data: plans });
    }
  } catch (err) {
    return handleError(err);
  }
};

export const postPlansController = async (req: NextRequest) => {
  try {
    const ownerId = req.headers.get("x-user-id")!;
    const json = await req.json();
    const data = { ...json, ownerId };
    await insertPlanPayload(data);
    return NextResponse.json({ status: "success" });
  } catch (err) {
    console.error(err);
    return handleError(err);
  }
};

export const deletePlanController = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  try {
    const { id } = await params;
    const numberId = Number(id);
    if (isNaN(numberId)) throw new CustomError(PathErrors.id_invalid, 400);
    await deletePlan(numberId);
    return NextResponse.json({ status: "success" });
  } catch (err) {
    return handleError(err);
  }
};

export const getPlanDetailsController = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  try {
    const ownerId = req.headers.get("x-user-id");
    const { id } = await params;
    // Check if id is number
    if (isNaN(Number(id))) throw new CustomError(PathErrors.id_invalid, 400);
    // Fetch Plan
    const planDetail = await getPlanDetails(Number(id));
    // Check id exist in plan and plan ownership
    if (!planDetail.id) throw new CustomError(PathErrors.id_not_found, 404);
    if (planDetail.ownerId !== ownerId || !planDetail.isPublic)
      throw new CustomError(AuthErrors.unauthorized_access, 403);
    return NextResponse.json({
      status: "success",
      data: planDetail,
    });
  } catch (err) {
    return handleError(err);
  }
};

export const putPlanController = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  try {
    const ownerId = req.headers.get("x-user-id")!;
    const json: Plan = await req.json();
    // Check if id is number
    const { id } = await params;
    if (isNaN(Number(id))) throw new CustomError(PathErrors.id_invalid, 400);
    // Check id exist in plan and plan ownership
    const planOwner = await getPlanOnwer(Number(id));
    if (planOwner !== ownerId)
      throw new CustomError(AuthErrors.unauthorized_access, 403);

    await clearPlan(Number(id));
    await insertPlanPayload({ ...json, ownerId, id: Number(id) });

    return NextResponse.json({
      status: "success",
    });
  } catch (err) {
    console.error(err);
    return handleError(err);
  }
};
