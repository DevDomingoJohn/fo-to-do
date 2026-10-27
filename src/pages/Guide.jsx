const guideSections = [
  {
    number: '01',
    title: 'Add and organize tasks',
    description: 'Capture tasks quickly, then group related work whenever you need more structure.',
    tips: [
      {
        title: 'Create a task',
        description: 'Open Task, enter a name in the Add a task field, and select Add. You can optionally assign it to a group before adding it.',
      },
      {
        title: 'Create a group',
        description: 'Open Task Groups and choose Create task group. Add a name, an optional description, and a color to make the group easy to recognize.',
      },
      {
        title: 'Add tasks to a group',
        description: 'Open a group to add tasks directly to it. You can also choose a group from the selector in the main task form.',
      },
    ],
  },
  {
    number: '02',
    title: 'Find and track your work',
    description: 'Use the task list and progress details to stay focused and see what is left.',
    tips: [
      {
        title: 'Search tasks',
        description: 'Use Search in the sidebar to find tasks by their text. Searching from another page takes you to the task list.',
      },
      {
        title: 'Filter the task list',
        description: 'On Task, use Show to display all tasks, only ungrouped tasks, or tasks from a specific group.',
      },
      {
        title: 'Update progress',
        description: 'Select a task checkbox to mark it done or reopen it. The task overview and each group’s progress indicator update automatically.',
      },
    ],
  },
  {
    number: '03',
    title: 'Edit, reorder, and delete',
    description: 'Keep lists tidy while knowing what can be recovered and what is permanent.',
    tips: [
      {
        title: 'Edit a task or group',
        description: 'Use the edit icon on a task or group card to change its details.',
      },
      {
        title: 'Reorder items',
        description: 'Drag a task by its dotted handle or move it with the up and down arrow keys when the handle is focused. Drag group cards or sidebar group links to reorder groups.',
      },
      {
        title: 'Delete safely',
        description: 'Swipe a task to the right and release past the delete mark. Choose Undo in the message that appears within 5 seconds to restore it. Deleting a group asks for confirmation and permanently deletes its tasks too.',
      },
    ],
  },
]

function Guide() {
  return (
    <article className="py-10 text-ink">
      <header className="mb-10 rounded-2xl border border-line bg-panel p-6 sm:p-8">
        <p className="eyebrow">A QUICK START</p>
        <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">How to use fo-to-do</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted sm:text-base">
          A practical guide to creating tasks, organizing them into groups, and managing your lists.
        </p>
      </header>

      <div className="flex flex-col gap-6">
        {guideSections.map((section) => (
          <section key={section.number} className="rounded-2xl border border-line bg-panel p-6 sm:p-8">
            <div className="mb-6 flex items-start gap-4">
              <span className="pt-0.5 text-sm font-medium tabular-nums text-muted">
                {Number(section.number)}.
              </span>
              <div>
                <h2 className="text-xl font-semibold text-ink">{section.title}</h2>
                <p className="mt-1 text-sm leading-6 text-muted">{section.description}</p>
              </div>
            </div>

            <div className="grid gap-5 border-t border-line pt-6 md:grid-cols-3">
              {section.tips.map((tip) => (
                <div key={tip.title}>
                  <h3 className="text-sm font-semibold text-ink">{tip.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted">{tip.description}</p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <p className="mt-6 text-center text-xs leading-5 text-muted">
        Your tasks and groups are saved in this browser on this device.
      </p>
    </article>
  )
}

export default Guide
