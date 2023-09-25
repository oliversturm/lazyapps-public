const notifyChanged = (s, { payload: changeInfo }) => {
  switch (changeInfo.changeKind) {
    case 'addRow':
      if (!s.data) s.data = [];
      s.data.push(changeInfo.details);
      break;

    case 'updateRow': {
      if (!s.data) return s;
      const index = s.data.findIndex(i => i.id === changeInfo.details.id);
      if (index >= 0)
        s.data[index] = { ...s.data[index], ...changeInfo.details };
      break;
    }

    case 'deleteRow': {
      if (!s.data) return s;
      const index = s.data.findIndex(i => i.id === changeInfo.details.id);
      if (index >= 0) s.data.splice(index, 1);
      break;
    }

    case 'all':
      s.loadRequired = Date.now();
      break;

    default:
      return s;
  }
};

export default notifyChanged;
