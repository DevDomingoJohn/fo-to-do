// This file is the app's source of truth for task groups.
// Each object represents one category (School, Personal, Work, etc.)
// and contains the tasks shown in the selected group page.
// If you add a new group or change task data, update this array here.
export const groups = [
  {
    id: 'school',
    name: 'School',
    color: 'bg-blue-500',
    tasks: [
      { id: 1, text: 'Finish DCIT 26 assignment', done: false },
      { id: 2, text: 'Review lecture notes', done: true },
      { id: 3, text: 'Prepare for quiz', done: false },
    ],
  },
  {
    id: 'personal',
    name: 'Personal',
    color: 'bg-emerald-500',
    tasks: [
      { id: 1, text: 'Grocery shopping', done: false },
      { id: 2, text: 'Gym workout', done: true },
      { id: 3, text: 'Call family', done: false },
    ],
  },
  {
    id: 'work',
    name: 'Work',
    color: 'bg-amber-500',
    tasks: [
      { id: 1, text: 'Submit weekly report', done: false },
      { id: 2, text: 'Team meeting at 3 PM', done: false },
    ],
  },
]
