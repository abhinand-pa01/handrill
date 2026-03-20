export function findBestWorker(service, workers) {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTimeMinutes = currentHour * 60 + currentMinute;

  const eligible = workers.filter(worker => {
    if (!worker.profile.online) return false;
    const specializes = worker.profile.specializations.includes(service.id);
    if (!specializes) return false;
    const [startH, startM] = worker.profile.workStartTime.split(':').map(Number);
    const [endH, endM] = worker.profile.workEndTime.split(':').map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    const available = currentTimeMinutes >= startMinutes && currentTimeMinutes <= endMinutes;
    return available;
  });

  if (eligible.length === 0) return null;

  eligible.sort((a, b) => {
    if (a.profile.activeJobCount !== b.profile.activeJobCount) {
      return a.profile.activeJobCount - b.profile.activeJobCount;
    }
    return b.profile.averageRating - a.profile.averageRating;
  });

  return eligible[0];
}

export function computeScore(profile) {
  const ratingScore = (profile.averageRating / 5.0) * 40;
  const jobScore = Math.min(profile.totalJobsCompleted / 200.0, 1.0) * 40;
  const onlineScore = profile.online ? 20 : 0;
  return Math.round(ratingScore + jobScore + onlineScore);
}

export function getAssignmentPreview(service, workers) {
  const worker = findBestWorker(service, workers);
  return {
    worker,
    estimatedWait: worker ? '30-45 minutes' : null,
    availableCount: workers.filter(w =>
      w.profile.online && w.profile.specializations.includes(service.id)
    ).length,
  };
}
