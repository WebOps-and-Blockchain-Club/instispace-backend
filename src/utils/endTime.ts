function endTime(currentTime: Date, endTime: Date): Boolean {
  if (currentTime.getTime() > endTime.getTime()) {
    return true;
  }
  return false;
}

function endTime2(currentTime: Date, endTime: Date): Boolean {
  if (currentTime.getFullYear() < endTime.getFullYear()) {
    // go to months and then days and hours and so on
    return true;
  }
  return false;
}
