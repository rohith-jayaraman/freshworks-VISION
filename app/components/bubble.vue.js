Vue.component('chatBubble', {
    template : `
            <div :class="bubbleClass" ref = "bubble">
                <div class = "ownerName"> {{owner}} </div>
                    <div class = "time-stamp-message">
                        {{message.timeStamp}}
                    </div>
                <div ref="bubbleMessage" class = "bubble-message">
                </div>
            </div>
            
    `,
    computed: {
        bubbleClass : function() {
            const isBotBubble = this.bubbleType === 'botBubble';
            return isBotBubble ? [{'bot-bubble': true}, 'animated', 'zoomIn'] : [{'user-bubble': true}, 'animated', 'zoomIn'];
        },
        owner: function() {
            const isBotBubble = this.bubbleType === 'botBubble';
            return isBotBubble ? 'Vision' : loggedInUser.contact.name;
        }
    },
    props: {
        message: Object,
        bubbleType: String
    },
    mounted() {
        if(this.message.isHTML) {
            this.$refs.bubbleMessage.innerHTML = this.message.messageSubject;
        }
        else {
            this.$refs.bubbleMessage.textContent = this.message.messageSubject;
        }
        if(this.bubbleType === 'botBubble') {
            this.$refs.bubble.classList.add('delay-2s')
        }
    }
});