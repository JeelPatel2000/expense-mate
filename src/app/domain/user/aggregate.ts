import { Aggregate } from "../../event-store/types"

export interface UserAggregate extends Aggregate {
    name: string
}