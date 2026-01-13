import { describe, expect, it } from "vitest";
import { MemoryUserRepo } from "../src/modules/users/repo/memoryUserRepo";

describe("MemoryUserRepo", () => {
  it("creates and fetches users", async () => {
    const repo = new MemoryUserRepo();
    const user = await repo.create({
      name: "Test",
      email: "test@example.com",
      role: "MEMBER",
      isActive: true
    });
    const fetched = await repo.getById(user.id);
    expect(fetched?.email).toBe("test@example.com");
    expect(await repo.list()).toHaveLength(1);
  });

  it("updates role and active flag", async () => {
    const repo = new MemoryUserRepo();
    const user = await repo.create({
      name: "Test",
      email: "test@example.com",
      role: "MEMBER",
      isActive: true
    });
    const updated = await repo.updateRoleActive(user.id, { role: "ADMIN", isActive: false });
    expect(updated?.role).toBe("ADMIN");
    expect(updated?.isActive).toBe(false);
  });
});
