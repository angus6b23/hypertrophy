/* eslint-disable @typescript-eslint/no-unused-vars */

import { handleError, handleSuccess } from "@/utils/handleError";
import {
  clearPlan,
  deletePlan,
  getPlanByLocalId,
  getPlanDetails,
  getPlanOnwer,
  getPublicPlans,
  getUserPlan,
  insertPlanPayload,
} from "@/utils/plans";
import { NextRequest } from "next/server";
import {
  AuthErrors,
  CustomError,
  PathErrors,
} from "share/interfaces/error-codes";
import { Plan, PublicPlan } from "share/interfaces/Workout";

export const getPlansController = async (req: NextRequest) => {
  try {
    const ownerId = req.headers.get("x-user-id")!;
    const plans = await getUserPlan(ownerId);
    return handleSuccess<Omit<Plan, "days">[]>(plans);
  } catch (err) {
    return handleError(err);
  }
};

export const getPublicPlansController = async (req: NextRequest) => {
  try {
    const params = new URL(req.nextUrl).searchParams;
    const page = Number(params.get("page")) || 1;
    if (isNaN(page)) {
      throw new Error(PathErrors.param_invalid);
    }
    const query = params.get("query") || "";
    const asc = params.get("asc")?.toLowerCase() !== "true" || false;
    const sort = params.get("sort") || "update";
    const plans = await getPublicPlans(query, page, Boolean(asc), sort);
    return handleSuccess<PublicPlan[]>(plans);
  } catch (err) {
    return handleError(err);
  }
};

export const postPlansController = async (req: NextRequest) => {
  try {
    const ownerId = req.headers.get("x-user-id")!;
    const json = await req.json();
    const data = { ...json, ownerId };
    const id = await insertPlanPayload(data);
    return handleSuccess({ id });
  } catch (err) {
    console.error(err);
    return handleError(err);
  }
};

export const deletePlanController = async (
  req: NextRequest,
  { params }: { params: Promise<{ localId: string }> },
) => {
  try {
    const ownerId = req.headers.get("x-user-id")!;
    const { localId } = await params;

    if (!localId) throw new CustomError(PathErrors.id_invalid, 400);

    await deletePlan(localId, ownerId);
    return handleSuccess();
  } catch (err) {
    return handleError(err);
  }
};

export const getPlanDetailsController = async (
  req: NextRequest,
  { params }: { params: Promise<{ localId: string }> },
) => {
  try {
    const ownerId = req.headers.get("x-user-id");
    const { localId } = await params;
    // Check if id is number
    if (!localId) throw new CustomError(PathErrors.id_invalid, 400);
    // Fetch Plan
    const planDetail = await getPlanDetails(localId, ownerId);
    // Check id exist in plan and plan ownership
    if (!planDetail.id) throw new CustomError(PathErrors.id_not_found, 404);
    if (planDetail.ownerId !== ownerId || !planDetail.isPublic)
      throw new CustomError(AuthErrors.unauthorized_access, 403);
    return handleSuccess<Plan>(planDetail);
  } catch (err) {
    return handleError(err);
  }
};

export const putPlanController = async (
  req: NextRequest,
  { params }: { params: Promise<{ localId: string }> },
) => {
  try {
    const ownerId = req.headers.get("x-user-id")!;
    const json: Plan = await req.json();
    // Check if id is number
    const { localId } = await params;
    if (!localId) throw new CustomError(PathErrors.id_invalid, 400);
    const plan = await getPlanByLocalId(localId, ownerId);
    const { id } = plan;

    await clearPlan(Number(id));
    const newId = await insertPlanPayload({ ...json, ownerId, id: Number(id) });
    return handleSuccess({ id: newId });
  } catch (err) {
    console.error(err);
    return handleError(err);
  }
};
