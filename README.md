# Ace Attorney Bluesky Bot

Bluesky bot that turns comment chains in Ace Attorney scenes. Inspired by https://github.com/LuisMayo/ace-attorney-twitter-bot and using https://github.com/LuisMayo/objection_engine. Currently being executed at https://bsky.app/profile/acecourtbot-jr.bsky.social.

## Getting Started
### Prerequisites 

- Every item in the [objection_engine prerequisites](https://github.com/LuisMayo/objection_engine/blob/main/README.md#prerequisites)
- Bluesky account credentials
  - Handle
  - App password  

### Installing

1. Clone the repository
    
        git clone https://github.com/douglaschu/ace-attorney-bsky-bot-ts.git

2. Install dependencies

        npm install

3. Copy `.env.example` (or whatever config file your project uses) to `.env` and fill in your Bluesky credentials
4. Build and run

### Docker Install
Alternatively, build and run with Docker:

        docker build -t ace-attorney-bsky-bot .
        docker run ace-attorney-bsky-bot



## Contributing

As with the other iterations of the Ace Attorney bot, I have no stringent rules around contribution due to the scale of the project. If there's an issue you'd like to fix, or an improvement you'd like to implement, please open a pull request. All contributions that fit into the project's objectives are welcome. If you're unsure about a change you're suggesting, feel free to open an issue first.



## License

[ISC](https://opensource.org/license/isc-license-txt)
