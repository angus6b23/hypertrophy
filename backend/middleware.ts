import {
  MiddlewareFactory,
  stackMiddlewares,
} from "@/middlewares/stackHandler";
import { withAuth } from "./middlewares/withAuth";

const middlewares: MiddlewareFactory[] = [withAuth];
export default stackMiddlewares(middlewares);
