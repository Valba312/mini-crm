import type { MemoryUserRepo } from "../modules/users/repo/memoryUserRepo";
import type { MemoryClientRepo } from "../modules/clients/repo/memoryClientRepo";
import type { MemoryProjectRepo } from "../modules/projects/repo/memoryProjectRepo";
import type { MemoryTaskRepo } from "../modules/tasks/repo/memoryTaskRepo";

export const seedData = async (
  usersRepo: MemoryUserRepo,
  clientsRepo: MemoryClientRepo,
  projectsRepo: MemoryProjectRepo,
  tasksRepo: MemoryTaskRepo
) => {
  const admin = await usersRepo.create({
    name: "Алексей Админ",
    email: "admin@mini-crm.local",
    role: "ADMIN",
    isActive: true
  });
  const manager = await usersRepo.create({
    name: "Марина Менеджер",
    email: "manager@mini-crm.local",
    role: "MANAGER",
    isActive: true
  });
  const member = await usersRepo.create({
    name: "Максим Исполнитель",
    email: "member@mini-crm.local",
    role: "MEMBER",
    isActive: true
  });

  const clientA = await clientsRepo.create({
    name: "ООО Луна",
    email: "contact@luna.ru",
    phone: "+7 999 123-45-67",
    notes: "Ключевой клиент, важна скорость ответа"
  });
  const clientB = await clientsRepo.create({
    name: "ИП Заря",
    email: "owner@zarya.ru",
    phone: "+7 999 222-33-44",
    notes: "Нужен редизайн и интеграция с оплатой"
  });

  const projectA = await projectsRepo.create({
    clientId: clientA.id,
    name: "CRM для отдела продаж",
    description: "Автоматизация воронки продаж и отчеты",
    status: "ACTIVE",
    budget: 350000,
    startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString()
  });

  const projectB = await projectsRepo.create({
    clientId: clientB.id,
    name: "Сайт + мини-CRM",
    description: "Новый сайт с личным кабинетом клиентов",
    status: "ON_HOLD",
    budget: 180000,
    startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45).toISOString(),
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString()
  });

  const projectC = await projectsRepo.create({
    clientId: clientA.id,
    name: "Поддержка и SLA",
    description: "Техподдержка и доработки",
    status: "ACTIVE",
    budget: 90000,
    startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60).toISOString()
  });

  await projectsRepo.addMember({ projectId: projectA.id, userId: admin.id, memberRole: "OWNER" });
  await projectsRepo.addMember({ projectId: projectA.id, userId: manager.id, memberRole: "MANAGER" });
  await projectsRepo.addMember({ projectId: projectA.id, userId: member.id, memberRole: "CONTRIBUTOR" });

  await projectsRepo.addMember({ projectId: projectB.id, userId: manager.id, memberRole: "OWNER" });
  await projectsRepo.addMember({ projectId: projectB.id, userId: member.id, memberRole: "CONTRIBUTOR" });

  await projectsRepo.addMember({ projectId: projectC.id, userId: admin.id, memberRole: "OWNER" });
  await projectsRepo.addMember({ projectId: projectC.id, userId: member.id, memberRole: "CONTRIBUTOR" });

  await tasksRepo.create({
    projectId: projectA.id,
    title: "Собрать требования",
    description: "Интервью с отделом продаж",
    assigneeId: manager.id,
    priority: "HIGH",
    status: "IN_PROGRESS",
    dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString()
  });

  await tasksRepo.create({
    projectId: projectA.id,
    title: "Проектирование БД",
    description: "ER-диаграмма + словарь данных",
    assigneeId: admin.id,
    priority: "MEDIUM",
    status: "REVIEW",
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString()
  });

  await tasksRepo.create({
    projectId: projectA.id,
    title: "Сбор UI-референсов",
    assigneeId: member.id,
    priority: "LOW",
    status: "TODO",
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10).toISOString()
  });

  await tasksRepo.create({
    projectId: projectB.id,
    title: "Подготовить прототип",
    assigneeId: manager.id,
    priority: "URGENT",
    status: "BLOCKED",
    dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString()
  });

  await tasksRepo.create({
    projectId: projectB.id,
    title: "Согласовать бюджет",
    assigneeId: admin.id,
    priority: "HIGH",
    status: "DONE",
    dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString()
  });

  await tasksRepo.create({
    projectId: projectC.id,
    title: "Обновить документацию",
    assigneeId: member.id,
    priority: "MEDIUM",
    status: "IN_PROGRESS",
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString()
  });
};
