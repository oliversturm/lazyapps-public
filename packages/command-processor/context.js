export const initializeContext = (
  { aggregateStore, eventStore, eventBus, aggregates },
  handleCommand,
) =>
  Promise.all([aggregateStore(aggregates), eventStore()])
    .then(([aggregateStore, eventStore]) => ({
      aggregates,
      aggregateStore,
      eventStore,
      handleCommand,
    }))
    .then((context) =>
      eventBus().then((eventBus) => ({ ...context, eventBus })),
    )
    // We run a full replay on startup, to get all aggregates
    // up and running. Not a great idea for production.
    .then((context) => context.eventStore.replay(context).then(() => context));
