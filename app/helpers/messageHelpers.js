function getProductCommands(commands, productMap) {
    const productCommands = {};
    productMap.forEach(targetProduct => {
        const productWiseCommands = commands.filter((command) => command.product === targetProduct);
        productCommands[targetProduct] = productWiseCommands;
    });
    return productCommands
}

function getHelpMessage(commands, productMap) {
    const helpMessage = 'Choose a product to get help <br> Type @product help <br> Like <b> @freshdesk help <b>';
    // const productCommands = getProductCommands(commands, productMap);
    // debugger;
    // let helpMessage  =  '<ul>';
    // commands.forEach(indivCommand => {
    //     helpMessage += `<li class = "help-message">
    //                         <div class = "help-command"> COMMAND:${indivCommand.command} </div>
    //                         <div class = "help-instruction"> INSTRUCTION: ${indivCommand.description} </div>
    //                     </li>`;
    // });
    return helpMessage;
}

function getTimeOffMessage() {
    let timeOffMessage = '';
    timeOffMessage += `
            PROVIDE TIME OFF DETAILS
    <div> Start Date: <input type="date" name="start" ref="startDate"> </div>
    <div>  End Date: <input type="date" name="end" ref="endDate"> </div>
    <div>  <button @click = "applyTimeOff">APPLY</button> </div>
    `;
    return timeOffMessage;
}