function request(url, options, data = {}) {
    if(!Object.keys(data).length) {
        return client.request.get(url, options);
    }
    return client.request.post(url, data, options);
}



function getCurrentAgentDetails() {
    const url = `${iparams.product_params.freshdesk.domain}/api/v2/agents/me`;
    return new Promise((resolve, reject) => {
        const options = {
            'headers': {
                'Authorization': `Basic ${btoa(iparams.product_params.freshdesk.key)}`
            }
        };
        request(url, options)
            .then(res => {console.log(res) ; return resolve(JSON.parse(res.response).id)})
            .catch(er =>
                reject(er)
                /**
                 * Use interface api
                 */
            )
    });
}

function getFilters() {
        const url = `${iparams.product_params.freshsales.domain}/api/deals/filters`;
        const options = {
            'headers': {
                'Authorization': `Token token=${iparams.product_params.freshsales.key}`,
                "Content-Type": "application/json"
            }
        };
        return new Promise((resolve, reject) => {
            request(url, options)
                .then(res => {
                    return resolve(JSON.parse(res.response).filters);
                })
        });
}

  
function getMyDealsFilterID() {
    return new Promise((resolve, reject) => {
        const MY_DEALS_FILTER = 'My Deals';
        getFilters().then(
            function (allFilters) {
                const myFilter = allFilters.find(filter => filter.name === MY_DEALS_FILTER);
                if(!myFilter) {
                    return null;
                }
                return resolve(myFilter.id);
            });
    });
  }
