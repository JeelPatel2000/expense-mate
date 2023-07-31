import { Aggregate } from "../../event-store/types";

export interface GroupAggregate extends Aggregate {
  name: string
}