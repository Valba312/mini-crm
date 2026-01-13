import { describe, expect, it } from "vitest";
import { MemoryTaskRepo } from "../src/modules/tasks/repo/memoryTaskRepo";

describe("MemoryTaskRepo", () => {
  it("creates tasks and updates status with history", async () => {
    const repo = new MemoryTaskRepo();
    const task = await repo.create({
      projectId: "project-1",
      title: "Task",
      priority: "HIGH",
      status: "TODO"
    });
    const result = await repo.updateStatus(task.id, "IN_PROGRESS", "user-1");
    expect(result?.task.status).toBe("IN_PROGRESS");
    expect(result?.history.taskId).toBe(task.id);
    expect((await repo.listStatusHistory(task.id))).toHaveLength(1);
  });
});
