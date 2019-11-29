Vue.component('chatInput',{
    template : `
        <div class="chat-input">
            <input 
                type="text" 
                class = "chat-input-box" 
                @focus = "hidePlaceholder" 
                @blur = "showPlaceholder" 
                v-model = "message"
                @keyup.enter = "sendMessage"
                :placeholder = "placeholder">
            <span class = "chat-send-button">
                <button class = "chat-send-button-primary" 
                        @click = "sendMessage"
                        >
                        <span> SEND </span>
                </button>
            </span>
        </div>
    `,
    data() {
        return {
            placeholder: 'Enter HELP to view all commands...',
            message: ""
        }
    },
    methods: {
        hidePlaceholder: function() {
            this.placeholder = '';
        },
        showPlaceholder: function() {
            this.placeholder = 'Enter HELP to view all commands...'
        },
        sendMessage: function() {
            const temp_message = this.message;
            this.message = '';
            this.$emit('sendMessage', temp_message)
        }
    }
});