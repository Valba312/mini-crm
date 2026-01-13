import "dotenv/config";
import express from "express";
import cors from "cors";
import { requestLogger } from "./middleware/requestLogger";
import { errorHandler } from "./middleware/errorHandler";
import { createFakeAuth } from "./middleware/fakeAuth";
import { MemoryUserRepo } from "./modules/users/repo/memoryUserRepo";
import { MemoryClientRepo } from "./modules/clients/repo/memoryClientRepo";
import { MemoryProjectRepo } from "./modules/projects/repo/memoryProjectRepo";
import { MemoryTaskRepo } from "./modules/tasks/repo/memoryTaskRepo";
import { SupabaseUserRepo } from "./modules/users/repo/supabaseUserRepo";
import { SupabaseClientRepo } from "./modules/clients/repo/supabaseClientRepo";
import { SupabaseProjectRepo } from "./modules/projects/repo/supabaseProjectRepo";
import { SupabaseTaskRepo } from "./modules/tasks/repo/supabaseTaskRepo";
import { UsersService } from "./modules/users/service/usersService";
import { ClientsService } from "./modules/clients/service/clientsService";
import { ProjectsService } from "./modules/projects/service/projectsService";
import { TasksService } from "./modules/tasks/service/tasksService";
import { ReportsService } from "./modules/reports/service/reportsService";
import { createUsersRouter } from "./modules/users/controller/usersController";
import { createClientsRouter } from "./modules/clients/controller/clientsController";
import { createProjectsRouter } from "./modules/projects/controller/projectsController";
import { createTasksRouter } from "./modules/tasks/controller/tasksController";
import { createReportsRouter } from "./modules/reports/controller/reportsController";
import { seedData } from "./seed/seedData";
import { supabase } from "./db/supabase";
import type { IUserRepo } from "./modules/users/repo/userRepo";
import type { IClientRepo } from "./modules/clients/repo/clientRepo";
import type { IProjectRepo } from "./modules/projects/repo/projectRepo";
import type { ITaskRepo } from "./modules/tasks/repo/taskRepo";

const app = express();
const port = Number(process.env.PORT ?? 4000);

const isSupabaseEnabled = !!supabase;

let usersRepo: IUserRepo;
let clientsRepo: IClientRepo;
let projectsRepo: IProjectRepo;
let tasksRepo: ITaskRepo;

if (isSupabaseEnabled) {
  usersRepo = new SupabaseUserRepo();
  clientsRepo = new SupabaseClientRepo();
  projectsRepo = new SupabaseProjectRepo();
  tasksRepo = new SupabaseTaskRepo();
} else {
  const memoryUsers = new MemoryUserRepo();
  const memoryClients = new MemoryClientRepo();
  const memoryProjects = new MemoryProjectRepo();
  const memoryTasks = new MemoryTaskRepo();
  await seedData(memoryUsers, memoryClients, memoryProjects, memoryTasks);
  usersRepo = memoryUsers;
  clientsRepo = memoryClients;
  projectsRepo = memoryProjects;
  tasksRepo = memoryTasks;
}

const usersService = new UsersService(usersRepo);
const clientsService = new ClientsService(clientsRepo);
const projectsService = new ProjectsService(projectsRepo);
const tasksService = new TasksService(tasksRepo);
const reportsService = new ReportsService(usersRepo, projectsRepo, tasksRepo);

app.use(cors());
app.use(express.json());
app.use(requestLogger);
app.use(createFakeAuth(usersRepo));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", db: isSupabaseEnabled ? "supabase" : "memory" });
});

app.use("/api/users", createUsersRouter(usersService));
app.use("/api/clients", createClientsRouter(clientsService));
app.use("/api/projects", createProjectsRouter(projectsService));
app.use("/api", createTasksRouter(tasksService));
app.use("/api/reports", createReportsRouter(reportsService));

app.use(errorHandler);

app.listen(port, () => {
  console.log(`API server running on http://localhost:${port}`);
});
