import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const tasks = [
  {
    title: 'Plan Road Trip',
    description: 'Map out the route and book hotels for the upcoming road trip.',
    priority: 1, // MEDIUM
    dueDate: new Date(Date.now() + 5 * 86400000), // In 5 days
    completed: false,
  },
  {
    title: 'Renew Gym Membership',
    description: 'Visit the gym to renew the annual membership.',
    priority: 2, // HIGH
    dueDate: new Date(Date.now() + 2 * 86400000), // In 2 days
    completed: true,
  },
  {
    title: 'Write Blog Post',
    description: 'Draft a new blog post about sustainable living.',
    priority: 1, // MEDIUM
    completed: true,
  },
  {
    title: 'Art Exhibition Visit',
    description: 'Attend the modern art exhibition downtown.',
    priority: 0, // LOW
    dueDate: new Date(Date.now() + 3 * 86400000), // In 3 days
    completed: false,
  },
  {
    title: 'Meal Prep',
    description: null,
    priority: 1, // MEDIUM
    completed: false,
  },
  {
    title: 'Client Presentation',
    description: 'Present the quarterly results to the client.',
    priority: 2, // HIGH
    dueDate: new Date(Date.now() + 1 * 86400000), // Tomorrow
    completed: false,
  },
  {
    title: 'Volunteer at Shelter',
    description: 'Spend the afternoon volunteering at the local animal shelter.',
    priority: 0, // LOW
    dueDate: new Date(Date.now() + 7 * 86400000), // In 7 days
    completed: true,
  },
  {
    title: 'Finish Puzzle',
    description: 'Complete the 1000-piece world map puzzle.',
    priority: 0, // LOW
    completed: false,
  },
  {
    title: 'Family Dinner',
    description: 'Host a family dinner on Sunday evening.',
    priority: 1, // MEDIUM
    dueDate: new Date(Date.now() + 4 * 86400000), // In 4 days
    completed: false,
  },
  {
    title: 'Software Update',
    description: 'Update the operating system and essential applications.',
    priority: 2, // HIGH
    completed: true,
  },
];

await prisma.task.createMany({ data: tasks });
