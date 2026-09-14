export function getElements() {
  const select = (selector) => document.querySelector(selector);

  return {
    networkBadge: select("#networkBadge"),
    syncSummary: select("#syncSummary"),

    form: select("#interviewForm"),
    interviewer: select("#interviewer"),
    respondent: select("#respondent"),
    topic: select("#topic"),
    interviewType: select("#interviewType"),
    startedAt: select("#startedAt"),
    locationText: select("#locationText"),
    locationMeta: select("#locationMeta"),
    notes: select("#notes"),

    getLocationBtn: select("#getLocationBtn"),
    photoInput: select("#photoInput"),
    photoPreview: select("#photoPreview"),
    photoPreviewWrap: select("#photoPreviewWrap"),
    removePhotoBtn: select("#removePhotoBtn"),
    newSessionBtn: select("#newSessionBtn"),
    sessionIdText: select("#sessionIdText"),

    historyList: select("#historyList"),
    emptyHistory: select("#emptyHistory"),
    syncNowBtn: select("#syncNowBtn"),

    apiUrl: select("#apiUrl"),
    saveApiBtn: select("#saveApiBtn"),
    enableNotificationsBtn: select("#enableNotificationsBtn"),
    storageInfo: select("#storageInfo"),

    detailDialog: select("#detailDialog"),
    detailContent: select("#detailContent"),
    closeDialogBtn: select("#closeDialogBtn"),

    toast: select("#toast"),
  };
}
