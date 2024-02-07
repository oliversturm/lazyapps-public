ManualResetEvent cancelEvent = new ManualResetEvent(false);

Console.CancelKeyPress += (s, ea) => {
  cancelEvent.Set();
  ea.Cancel = true;
};

Console.WriteLine(".NET Read Model not doing anything!");

cancelEvent.WaitOne();
