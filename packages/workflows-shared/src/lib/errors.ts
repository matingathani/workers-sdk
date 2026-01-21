export class WorkflowTimeoutError extends Error {
	name = "WorkflowTimeoutError";
}

export class WorkflowInternalError extends Error {
	name = "WorkflowInternalError";
}

export class WorkflowFatalError extends Error {
	name = "WorkflowFatalError";

	toJSON() {
		return {
			name: this.name,
			message: this.message,
		};
	}
}

export class WorkflowError extends Error {
	name = "WorkflowError";
}

export function createWorkflowError(
	message: string,
	errorCode: string
): WorkflowError {
	return new WorkflowError(`(${errorCode}) ${message}`);
}

// TODO: review this function - not the best
// maybe add the errors to a list and verify if the thrown error is on that list
export function isAbortError(e: unknown): boolean {
	if (e instanceof Error) {
		return e.message.includes("Aborting engine:");
	}
	if (typeof e === "object" && e !== null) {
		const msg = (e as { message?: string }).message;
		if (typeof msg === "string") {
			return msg.includes("Aborting engine:");
		}
	}
	return false;
}

export function isUserTriggeredTerminate(e: unknown): boolean {
	if (e instanceof Error) {
		return e.message.includes("Aborting engine: User called terminate");
	}
	return false;
}

export function isUserTriggeredRestart(e: unknown): boolean {
	if (e instanceof Error) {
		return e.message.includes("Aborting engine: User called restart");
	}
	return false;
}

export function isUserTriggeredPause(e: unknown): boolean {
	if (e instanceof Error) {
		return e.message.includes("Aborting engine: User called pause");
	}
	return false;
}
