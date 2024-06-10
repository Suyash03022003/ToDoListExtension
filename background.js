chrome.alarms.onAlarm.addListener(function(alarm) {
    if (alarm.name === "hourlyTaskReminder") {
        displayTaskCompletionReminder();
    }
});

chrome.runtime.onInstalled.addListener(function() {
    createHourlyNotificationAlarm();
});

function createHourlyNotificationAlarm() {
    chrome.alarms.create("hourlyTaskReminder", { periodInMinutes: 180 }); 
}

function displayTaskCompletionReminder() {
    console.log("called")
    getUnfinishedTasks().then(unfinishedTasks => {
        if (unfinishedTasks.length > 0) {
            const notificationTitle = "Task Reminder!";
            const notificationMessage = `You have ${unfinishedTasks.length} unfinished tasks. Don't forget to complete them!`;
    
            chrome.notifications.create("taskCompletionReminder", {
                type: 'basic',
                iconUrl: 'notificationIcon.png',
                title: notificationTitle,
                message: notificationMessage
            });
        }
    })
}

function getUnfinishedTasks() {
    return new Promise((resolve, reject) => {
        let inCompletedTasks = [];
        chrome.storage.sync.get('tasks', function (data) {
        if (data.tasks) {
            data.tasks.forEach(task => {
            if (!isChecked(task))
                inCompletedTasks.push(task);
            });
        }
        resolve(inCompletedTasks);
        });
    });
}

function isChecked(task) {
  return task.includes('&check;');
}
