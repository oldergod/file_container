'use strict';

function fetchNtf() {
    return fetch('/k/api/ntf/list.json', {
            credentials: 'include',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: "{}"
        }).then(response => response.json());
};

self.addEventListener('push', function(event) {
    console.log('Received a push message', event);

    event.waitUntil(
        fetchNtf().then(function(json) {
            if (!json.success) {
                console.log('did not succeed ?', result);
                return;
            }
            var result = json.result;
            var ntfs = result.ntf.slice(0, 3);
            var senders = result.senders;
            var showNtfPromises = ntfs.map(function(ntf) {
                return self.registration.showNotification(ntf.content.title.text, {
                    actions: [{
                        action: 'flag',
                        title: 'フラグ付ける'
                    }, {
                        action: 'profile',
                        title: 'プロフィール見る'
                    }],
                    body: ntf.content.message.text,
                    icon: '//raw.githubusercontent.com/oldergod/file_container/master/icon512.png',
                    tag: `kintone-${ntf.moduleType}`,
                    vibrate: [200, 100, 200, 100, 200, 100, 200]
                });
            });
            return Promise.all(showNtfPromises);
        })
    );
});


self.addEventListener('notificationclick', function(event) {
    console.log('On notification click: ', event.notification.tag);
    // Android doesn’t close the notification when you click on it
    // See: http://crbug.com/463146
    event.notification.close();

    var url_to_open = '/k/m/';
    // This looks to see if the current is already open and
    // focuses if it is
    event.waitUntil(clients.matchAll({
        type: "window"
    }).then(function(clientList) {
        for (var i = 0; i < clientList.length; i++) {
            var client = clientList[i];
            if (client.url.endsWith(url_to_open) && 'focus' in client)
                return client.focus();
        }
        if (clients.openWindow)
            return clients.openWindow(url_to_open);
    }));
});
