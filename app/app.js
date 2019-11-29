'use strict';

function mainApp() {
    client.iparams.get().then(function(response) {
        window.iparams = response; 
        return client.data.get('loggedInUser');
    })
    .then(data => {
        window.loggedInUser = data.loggedInUser;
        const vm = new Vue({
            template: `
                        <main-view />
                    `
        });
        vm.$mount('#app');
    });
}

(function () {
    $(document).ready(function () {
        app.initialized().then(function (_client) {
            window.client = _client;
            client.events.on('app.activated',mainApp);
        })
        .catch(console.error);
    });
})();
