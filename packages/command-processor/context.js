export const initializeContext = (
  correlationConfig,
  { aggregateStore, eventStore, eventBus, aggregates },
  handleCommand,
  handleAdminCommand,
) =>
  Promise.all([aggregateStore(aggregates), eventStore()])
    .then(([aggregateStore, eventStore]) => ({
      aggregates,
      aggregateStore,
      eventStore,
      handleCommand,
      handleAdminCommand,
      correlationConfig,
    }))
    .then((context) =>
      eventBus().then((eventBus) => ({ ...context, eventBus })),
    )
    // We run a full replay on startup, to get all aggregates
    // up and running. Not a great idea for production.
    .then((context) =>
      context.eventStore
        .replay('INIT' /*correlationId*/)(context)
        .then(() => context),
    );
