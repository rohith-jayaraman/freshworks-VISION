const productHelp = (allCommands, productName) => {
    return new Promise((resolve, reject) => {
        const targetCommands = allCommands[productName]
        let productHelpMessage = `<div><div> ${productName.toUpperCase()} commands</div> <ol> `;
        targetCommands.forEach((targetCommand) => {
            productHelpMessage += `<li> Run <b>${targetCommand.command}</b> that lists ${targetCommand.description}</li>`;
        });
        productHelpMessage += '</ol></div>';
        return resolve({
            message: productHelpMessage,
            isHTML: true
        });
    })
}

function getCurrentlyLoggedInEmployeeID() {
    const email_id = 'neville@yopmail.com'
    const url = `${iparams.product_params.freshteam.domain}/api/employees?personal_email=${email_id}`;
    request(url, ft_options)
        .then(
            function (res) {
                return resolve(res.data[0].id);
            }
        );
}


const generateTicketsTable = ({ results, total }, command) => {
    if (!total) {
        return {
            message: `You do not have any tickets that are ${command}`,
            isHTML: false
        }
    }
    const priorities = ['low', 'medium', 'high', 'urgent'];
    let tableMessage = `<table class = 'fd-tickets-table'> 
                            <tr> 
                            <th> Subject </th>
                            <th> Priority </th>
                            <th> TICKET </th>
                            </tr>`;
    results.forEach(ticket => {
        tableMessage +=
            `
                        <tr>
                        <td> ${ticket.subject} </td>
                        <td> ${priorities[ticket.priority - 1]} </td>
                        <td> <a style = "color:white" href = '${iparams.product_params.freshdesk.domain}/a/tickets/${ticket.id}'> VIEW TICKET </a></td>
                        </tr>
                        `;
    });
    tableMessage += '</table>';
    return {
        message: tableMessage,
        isHTML: true
    };
}

const generateEventsTable = (events) => {
    if (!events.length) {
        return {
            message: `You do not have any meetings today`,
            isHTML: false
        }
    }
    let tableMessage = `<table class = 'fd-tickets-table'> 
                            <tr> 
                            <th> Subject </th>
                            <th> Start time </th>
                            <th> End Time </th>
                            </tr>`;
    events.forEach(event => {
        tableMessage +=
            `
                        <tr>
                        <td> ${event.name} </td>
                        <td> ${event.start} </td>
                        <td> ${event.end} </td>
                        </tr>
                        `;
    });
    tableMessage += '</table>';
    return {
        message: tableMessage,
        isHTML: true
    };
}

const commandRequestHelpers = {
    getTickets: function (currentCommand) {
        return new Promise((resolve, reject) => {
            let coreCommand = '';
            getCurrentAgentDetails()
                .then(agentId => {
                    let url = '', message = '';
                    coreCommand = currentCommand.command.substring(currentCommand.command.indexOf(' ') + 1);
                    if (coreCommand == 'due today') {
                        const due_date = getTodaysDate();
                        message = "Viewed tickets due today";
                        url = `${iparams.product_params.freshdesk.domain}/api/v2/search/tickets?query="(due_by:'${due_date}') AND (agent_id : ${agentId})"`
                    } else if (coreCommand == 'priority high') {
                        message = "Viewed tickets whose priority is high";
                        url = `${iparams.product_params.freshdesk.domain}/api/v2/search/tickets?query="(priority:3) AND (agent_id : ${agentId})"`
                    } else if (coreCommand == 'unresolved') {
                        message = "Viewed tickets that are unresolved"
                        url = `${iparams.product_params.freshdesk.domain}/api/v2/search/tickets?query="( ( status:2 OR status:3 ) AND (agent_id : ${agentId}))"`
                    }
                    return request(url, { 'headers': { 'Authorization': `Basic ${btoa(iparams.product_params.freshdesk.key)}` } });
                })
                .then(response => {
                    const tickets = JSON.parse(response.response);
                    resolve(generateTicketsTable(tickets, coreCommand));
                })
                .catch(/**Interface api */)
        });
        //     client.db.update('activities', 'increment', {
        //       'freshdesk': {
        //         message: message,
        //         timestamp: timestamp()
        //       }
        //     }).then(function (data) {
        //       console.log("Successfully stored freshdesk notif")
        //     },
        //       function (err) {
        //         console.log("Error in storing fd notif : " + err.message)
        //       });
        //     return result;
        //   }
    },
    revenueEstimate: function (currentCommand) {
        return new Promise((resolve, reject) => {
            getMyDealsFilterID()
                .then(function (view_id) {
                    const url = `${iparams.product_params.freshsales.domain}/api/deals/view/${view_id}`;
                    const options = {
                        'headers': {
                            'Authorization': `Token token=${iparams.product_params.freshsales.key}`
                        }
                    };
                    return request(url, options);
                })
                .then(function (res) {
                    const allOfMyDeals = JSON.parse(res.response).deals;
                    let totalSum = 0;
                    allOfMyDeals.forEach(deal => {
                        totalSum += Number(deal.amount);
                    });

                    if (totalSum) {
                        //dbUpdate(`Requested revenue estimate which equaled ${totalSum}`, 'freshsales');
                        resolve({
                            message: `$${totalSum} is the estimated revenue that will be made by the end of the year`,
                            isHTML: false
                        });
                    }
                });
        }
        )
    },
    requestMac: function () {
        return new Promise((resolve, reject) => {
            const authorizedKey = btoa(`${iparams.product_params.freshservice.key}`)
            const headers = {
                "Authorization": `Basic ${btoa(iparams.product_params.freshservice.key)}`,
                "Content-Type": "application/json"
            }
            var url = `${iparams.product_params.freshservice.domain}/catalog/request_items/10/service_request.json`;
            var data = {
                "requested_item_values": {
                    "10": {
                        "item_id": "27000084144",
                        "quantity": "1"
                    }
                },
                "requested_for": "akshaya@yopmail.com",
                "requester_email": "akshaya@yopmail.com"
            }
            const fs_options = {
                "headers": headers,
                "body": JSON.stringify(data)
            }
            client.request.post(url, fs_options)
                .then(
                    function (createResult) {
                        const data = JSON.parse(createResult.response);
                        if (data.service_request.id > 0) {
                            const ticketId = data.service_request.display_id;
                            const fs_domain = iparams.product_params.freshservice.domain;
                            resolve({
                                message: `<div>Your request for MacBook was created.</div>
                                     <div> Approval request has been sent.</div>
                                     <div><a href = '${fs_domain}/helpdesk/tickets/${ticketId}' target="_blank"> #${ticketId} </a></div>`,
                                isHTML: true
                            });
                        }
                    });
        })
    },
    requestMouse: function () {
        return new Promise((resolve, reject) => {
            const authorizedKey = btoa(`${iparams.product_params.freshservice.key}`)
            const headers = {
                "Authorization": `Basic ${btoa(iparams.product_params.freshservice.key)}`,
                "Content-Type": "application/json"
            }
            var url = `${iparams.product_params.freshservice.domain}/catalog/request_items/14/service_request.json`;
            var data = {
                "requested_item_values": {
                    "14": {
                        "item_id": "27000084148",
                        "quantity": "1"
                    }
                },
                "requested_for": "akshaya@yopmail.com",
                "requester_email": "akshaya@yopmail.com"
            }
            const fs_options = {
                "headers": headers,
                "body": JSON.stringify(data)
            }
            client.request.post(url, fs_options)
                .then(
                    function (createResult) {
                        const data = JSON.parse(createResult.response);
                        if (data.service_request.id > 0) {
                            const ticketId = data.service_request.display_id;
                            const fs_domain = iparams.product_params.freshservice.domain;
                            resolve({
                                message: `<div>Your request for Wireless mouse was created.</div>
                                     <div> Approval not needed.</div>
                                     <div><a href = '${fs_domain}/helpdesk/tickets/${ticketId}' target="_blank"> #${ticketId} </a></div>`,
                                isHTML: true
                            });
                        }
                    });
        })
    },
    meetingDetails: function () {
        return new Promise((resolve, reject) => {
            const events = []
            const url = "https://www.googleapis.com/calendar/v3/calendars/dracomalfboy13@gmail.com/events?key=AIzaSyD5rlRP1M6DWrBSgHYx4QUVWhhnVqIx9Kg";
            request(url, {})
                .then(calendar => {
                    const meetings = JSON.parse(calendar.response)
                    meetings.items.forEach(event => {
                        events.push({
                            name: event.summary,
                            start: event.start.dateTime,
                            end: event.end.dateTime
                        });
                    });
                    resolve(generateEventsTable(events));
                });
        })
    }
}

function getTodaysDate() {

    const date = new Date();
    const yyyy = date.getFullYear().toString();
    const mm = (date.getMonth() + 1).toString();
    const dd = date.getDate().toString();

    const mmChars = mm.split('');
    const ddChars = dd.split('');

    return yyyy + '-' + (mmChars[1] ? mm : "0" + mmChars[0]) + '-' + (ddChars[1] ? dd : "0" + ddChars[0]);
}



const ft_headers = {
    "Authorization": `Bearer ${iparams.product_params.freshteam.key}`,
    "Content-Type": "application/json",
    "accept": "application/json"
};

const ft_options = {
    'headers': ft_headers
};

function sendTimeoffDetails(event) {
    const ft_headers = {
        "Authorization": `Bearer ${iparams.product_params.freshteam.key}`,
        "Content-Type": "application/json",
        "accept": "application/json"
    };
    const requestTimeOff =  function (isEarned, reason, start_date, end_date) {
        return new Promise((resolve, reject) => {
            let leave_type_id = 6660; //default is Earned leave.

            if (isEarned) {
                leave_type_id = 6661; //changing to sick leave.
            }

            const object = {
                "start_date": start_date,
                "end_date": end_date,
                "optional_leave_days": [],
                "notify_to": [],
                "add_to_calendar": false,
                "auto_decline_events": false,
                "leave_type_id": leave_type_id,
                "comments": reason
            };
            const ft_options = {
                'headers': ft_headers,
                'body': JSON.stringify(object)
            };
            let message = "";
            const url = `${iparams.product_params.freshteam.domain}/api/time_offs`;
            client.request.post(url, ft_options)
                .then((resp) => {
                    const timeoff = JSON.parse(resp.response);
                    if (timeoff.id && resp.status === 201) {
                        if (leave_type_id == 6661) {
                            message = `Earned leave applied for ${start_date} to ${end_date}`;
                        }
                        else {
                            message = `Sick leave applied for ${start_date} to ${end_date}`;
                        }
                        return client.interface.trigger("showNotify", {
                            type: "success", title: "Success",
                            message
                          })
                    }
                    return client.interface.trigger("showNotify", {
                        type: "alert", title: "Alert",
                        message: 'Unable to process request :('
                      });
                })
    });
    }
    const targetButton = event.target;
    const timeOffParent = targetButton.parentElement.parentElement.parentElement.parentElement;
    const timeOffEarned = timeOffParent.querySelector('#time-off-earned').checked;
    const timeOffReason = timeOffParent.querySelector('#time-off-reason').value;
    const startDate = timeOffParent.querySelector('#start-date').value;
    const endDate = timeOffParent.querySelector('#end-date').value;

    const isEarned = timeOffEarned;
    return requestTimeOff(isEarned, timeOffReason, startDate, endDate);
}


