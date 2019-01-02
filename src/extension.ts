// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import * as moment from 'moment';
import { spawn } from 'child_process';

const cloudinary = require('cloudinary');
cloudinary.config({
	cloud_name: process.env.CLOUDINARY_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET
});

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
	Logger.channel = vscode.window.createOutputChannel("pasteImage");
	context.subscriptions.push(Logger.channel);

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	Logger.log('Congratulations, your extension "paste" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('extension.pasteImage', () => {
		// The code you place here will be executed every time your command is executed

		try {
			const scriptPath = path.join(__dirname, '../script/mac.applescript');
			Logger.showInformationMessage(scriptPath);
			let ascript = spawn('osascript', [scriptPath, `/Users/meganii/src/github.com/meganii/vscode-test-extension/paste/${getImagePath()}`]);

			ascript.stdout.on('data', (data) => {
				Logger.showInformationMessage(`stdout: ${data}`);
				cloudinary.v2.uploader.upload(data.toString().trim(), (error: Error, result: any) => {
                    if (error) { 
						Logger.showErrorMessage(error.message);
						return;
					}
					let editor = vscode.window.activeTextEditor;
					if (!editor) {
						Logger.showInformationMessage('no editor');
						return ;
					}

					editor.edit(edit => {
					let current = (editor as vscode.TextEditor).selection;
						if (current.isEmpty) {
							edit.insert(current.start, getHugoImgTag(result));
						} else {
							edit.replace(current, getHugoImgTag(result));
						}
					});
				});
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

function getHugoImgTag (result: any) {
	return `{{% img src="${result.secure_url}" w="${result.width}" h="${result.height}" %}}`;
}