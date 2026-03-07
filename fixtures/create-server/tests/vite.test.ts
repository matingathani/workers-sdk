import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, beforeAll, describe, it } from "vitest";
import { createServer } from "wrangler";

const mockServer = setupServer(
	http.get("http://example.com/:worker/:phase", ({ params }) => {
		const worker = String(params.worker);
		const phase = String(params.phase);
		const key = `${worker}:${phase}`;
		return HttpResponse.text(`mock:${key}`);
	})
);
const workerServer = createServer({
	outbound: (request) => fetch(request.url, request),
});
const primary = workerServer.getWorker();
const auxiliary = workerServer.getWorker("auxiliary-worker");

describe("createServer: vite project setup", () => {
	beforeAll(async () => {
		mockServer.listen({ onUnhandledRequest: "error" });
		await workerServer.listen();
	});

	afterAll(async () => {
		mockServer.close();
		await workerServer.close();
	});

	it("could fetch workers with mocking support", async ({ expect }) => {
		const primaryResponse = await primary.fetch("http://example.com", {
			signal: AbortSignal.timeout(10_000),
		});
		expect(await primaryResponse.json()).toEqual({
			worker: "primary",
			fetchMock: "mock:primary:fetch",
			lastScheduledMock: "not-run",
		});
		const auxiliaryResponse = await auxiliary.fetch("http://example.com", {
			signal: AbortSignal.timeout(10_000),
		});
		expect(await auxiliaryResponse.json()).toEqual({
			worker: "auxiliary",
			fetchMock: "mock:auxiliary:fetch",
			lastScheduledMock: "not-run",
		});
	});

	it("support triggering scheduled events with custom scheduledTime", async ({
		expect,
	}) => {
		expect(
			await primary.scheduled({
				cron: "* * * * *",
				scheduledTime: new Date(1_700_000_100_000),
			})
		).toEqual({ outcome: "ok", noRetry: false });
		expect(
			await auxiliary.scheduled({
				cron: "*/5 * * * *",
				scheduledTime: new Date(1_700_000_101_000),
			})
		).toEqual({ outcome: "ok", noRetry: false });
	});
});
