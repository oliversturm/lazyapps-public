const exists = agg => {
  if (!agg.creationTimestamp) throw new Error(`The aggregate doesn't exist`);
};

const doesntExist = agg => {
  if (agg.creationTimestamp) throw new Error(`The aggregate exists already`);
};

const has = (ob, field) => {
  if (!ob[field])
    throw new Error(
      `The object doesn't include the required field '${field}', or its value is empty`,
    );
};

export { exists, doesntExist, has };
