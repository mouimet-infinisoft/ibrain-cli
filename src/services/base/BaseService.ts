import { TStore } from "@brainstack/core";
import { Logger } from "@brainstack/log";

export abstract class BaseService {
    constructor(
        protected logService: Logger,
        protected storeService: TStore
    ){}
}