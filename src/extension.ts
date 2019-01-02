// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import * as moment from 'moment';
import { spawn } from 'child_process';

class Logger {
    static channel: vscode.OutputChannel;

    static log(message: any) {
        if (this.channel) {
            let time = moment().format("MM-DD HH:mm:ss");
            this.channel.appendLine(`[${time}] ${message}`);
        }
    }

    static showInformationMessage(message: string, ...items: string[]) {
        this.log(message);
        return vscode.window.showInformationMessage(message, ...items);
    }

    static showErrorMessage(message: string, ...items: string[]) {
        this.log(message);
        return vscode.window.showErrorMessage(message, ...items);
    }
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	Logger.channel = vscode.window.createOutputChannel("helloworld");
	context.subscriptions.push(Logger.channel);

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	Logger.log('Congratulations, your extension "paste" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('extension.helloWorld', async () => {
		// The code you place here will be executed every time your command is executed

		try {
			const scriptPath = path.join(__dirname, '../script/mac.applescript');
			Logger.showInformationMessage(scriptPath);
			let ascript = spawn('osascript', [scriptPath, `/Users/meganii/src/github.com/meganii/vscode-test-extension/paste/${getImagePath()}`]);

			ascript.stdout.on('data', (data) => {
				Logger.showInformationMessage(`stdout: ${data}`);
			});
			  
			ascript.stderr.on('data', (data) => {
				Logger.showInformationMessage(`stderr: ${data}`);
			});
			
			ascript.on('close', (code) => {
				Logger.showInformationMessage(`child process exited with code ${code}`);
			});
		} catch (e) {
			Logger.showErrorMessage(e);
		}
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}

function getImagePath () {
	return `${moment().format('Y-MM-DD-HH-mm-ss')}.png`;
}