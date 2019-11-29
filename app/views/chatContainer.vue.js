Vue.component('chatContainer',{
    template : `
        <div class="chat-container light-primary-color">
            <div class = "chat-container-header default-primary-color">
                VISION
                <span class = "activities">
                    <button class = "activities-btn">
                        ACTIVITIES
                    </button>
                </span>
            </div>
            <div class = "messages">
                <div v-for = "message in messages">
                    <chat-bubble :bubbleType = "message.owner === 'user' ? 'senderBubble' : 'botBubble'"
                    :message = "message" />
                </div>
            </div>
            <chat-input 
                @sendMessage = sendMessage />
        </div>
    `,
    data() {
        return {
            messages: [],
            productMap: ['freshdesk', 'freshsales', 'freshservice', 'freshteam'],
            commands: {
                freshdesk: [
                  {
                    name: 'tickets-today',
                    command: '@freshdesk due today',
                    description: 'lists all tickets due today',
                    handler: (currentCommand, allCommands) => { return commandRequestHelpers.getTickets(currentCommand); }
                  },
                  {
                    name: 'unresolved-tickets',
                    command: '@freshdesk unresolved',
                    description: 'lists unresolved tickets',
                    handler: (currentCommand, allCommands) => { return commandRequestHelpers.getTickets(currentCommand); }
                  },
                  {
                    name: 'priority',
                    command: '@freshdesk priority high',
                    description: 'lists high priority tickets/issues',
                    handler: (currentCommand, allCommands) => { return commandRequestHelpers.getTickets(currentCommand); }
                  },
                  {
                    name: 'help',
                    command: '@freshdesk help',
                    description: 'lists all available commands for freshdesk',
                    handler: (currentCommand, allCommands) => { return productHelp(allCommands, 'freshdesk') }
                  }
                ],
                freshsales: [
                    {
                      name: 'revenue-estimate',
                      command: '@freshsales revenue estimate',
                      description: 'estimated revenue from possible deals by end of the year',
                      handler: (currentCommand, allCommands) => { return commandRequestHelpers.revenueEstimate(currentCommand); }
                    },
                    {
                      name: 'help',
                      command: '@freshsales help',
                      description: 'lists all available commands for freshsales',
                      handler: (currentCommand, allCommands) => { return productHelp(allCommands, 'freshsales') }
                    }
                  ],
                freshservice: [
                      {
                        name: 'request-mouse',
                        command: '@freshservice request mouse',
                        description: 'Request for a wireless mouse',
                        handler: (currentCommand, allCommands) => { return commandRequestHelpers.requestMouse(); }
                      },
                      {
                        name: 'request-mac',
                        command: '@freshservice request mac',
                        description: 'Request for a Macbook',
                        handler: (currentCommand, allCommands) => { return commandRequestHelpers.requestMac(); }
                      },
                      {
                        name: 'help',
                        command: '@freshservice help',
                        description: 'lists all available commands for freshservice',
                        handler: (currentCommand, allCommands) => {  return productHelp(allCommands, 'freshservice')}
                      }
                    ],
                freshteam: [
                        {
                          name: 'request-timeoff',
                          command: '@freshteam apply timeoff',
                          description: 'Request for a time-off on any day in your Freshteam',
                          handler: () => { 
                            const timeOffInputs = this.setTimeoffInputs();
                            return new Promise((resolve) => resolve(timeOffInputs));
                          }
                        },
                        {
                          name: 'help',
                          command: '@freshteam help',
                          description: 'lists all available commands for freshteam',
                          handler: (currentCommand, allCommands) => { return productHelp(allCommands, 'freshteam') }
                        }
                      ],
                        common: [
                          {
                            name: 'help',
                            command: 'help',
                            description: 'List all commands',
                            handler: () => commonHelp
                          },
                          {
                            name: 'meetings',
                            command: '@jarvis meetings',
                            description: 'Schedule a daily remainder of your meetings',
                            handler: (currentCommand, allCommands) => { return commandRequestHelpers.meetingDetails(); }
                          },
                    ]
              }
        }
    },
    props: {
    },
    methods: {
        pushMessage: function(messageObj) {
            this.messages.push({
                messageSubject: messageObj.message,
                timeStamp: this.getCurrentTime(),
                owner: messageObj.owner ? messageObj.owner : 'bot',
                isHTML: messageObj.isHTML
            });
        },
        getCurrentTime: function() {
            const date = new Date();
            return `${date.getHours()}:${date.getMinutes()} ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
        },
        getRespectiveCommand: function(messageText) {
            return messageText.toLowerCase().trim();
        },
        executeTargetCommand: function(targetCommand) {
            if(targetCommand[0] === '@'){
                if(targetCommand === '@jarvis meetings'){
                  this.commands['common'][1].handler(targetCommand, this.commands)
                  .then((botResponse) => {
                    this.pushMessage(botResponse);
                })
                }
                else {
                  const product = targetCommand.substring(1, targetCommand.indexOf(' '));
                  const correctCommand = this.commands[product].filter(commandElement => {
                    if(commandElement.command === targetCommand) {
                      commandElement.handler(commandElement, this.commands)
                            .then((botResponse) => {
                                this.pushMessage(botResponse);
                            })
                        }
                  });
                }
              }
              else if(targetCommand === 'help') {
                this.pushMessage({
                    isHTML: true,
                    message: 'Type "@jarvis meetings" to get your schedule for the day <br> or type @product command to call any other command <br> <b>@freshdesk due today<b> <br> Type @product help to see product wise commands'
                });
              }
              else {
                return 'invalid command entered';
              }
        },
        executeCommand: function(currentMessageObj) {
            const targetCommand = this.getRespectiveCommand(currentMessageObj.message);
            const response = this.executeTargetCommand(targetCommand);
        },
        reportError: function() {
            this.pushMessage({
                message: 'Oops!!... Enter HELP to view commands',
                isHTML: false
            });
        },
        setTimeoffInputs: function() {
            let timeOffHtml = '';
            timeOffHtml += `<div class = 'time-off-input-container'>
            <label class='time-off-label'> Choose a timeoff type 
            <div class = 'time-off-radio-group'><input type = 'radio' name="time-off-type" id = 'time-off-earned'> Earned </div>
            
              <div class = 'time-off-radio-group'><input type = 'radio' name = "time-off-type" id = 'time-off-sick'> Sick </div>
          <label class = 'time-off-label'> Whats the reason for your timeoff
            <div> <input id = 'time-off-reason' class = 'time-off-input' type='text'> </div>
           
            <label class = 'time-off-label'> Choose the leave range </label>
            <label class = 'time-off-label'> Start: </label><div> <input id ='start-date' class = 'time-off-input' type = 'date'>
            
              <div> 
                <label class = 'time-off-label'> End: </label><div> <input id = 'end-date' class = 'time-off-input' type = 'date'>    </div>
            </div>
            <button class='time-off-button' onclick = 'sendTimeoffDetails(event)'> APPLY </button>
          </div>`;

          return {
            message: timeOffHtml,
            isHTML: true
          };
        },
        sendMessage: function(currentMessage) {
            const currentMessageObj = {
                message: currentMessage,
                isHTML: false,
                owner: 'user'
            };
            this.pushMessage(currentMessageObj);
            this.executeCommand(currentMessageObj)
        },
    },
    mounted() {
        this.pushMessage({
            message: `<div> Hi ${loggedInUser.contact.name}.<span style='font-size:40px;'>&#128515;</span></div>
                      <div>I am VISION. Your personal Freshworks Assistant</div>
                      <div> <b> Enter HELP to see what I can do right now </div>
                      <div> WOW MOMENTS AHEAD <span style='font-size:30px;'>&#128526;</span> </div>
                      `,
            isHTML: true
        })
    }
});