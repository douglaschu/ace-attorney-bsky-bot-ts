# Ace Attorney Bluesky Bot

Bluesky bot that turns comment chains in Ace Attorney scenes. Inspired by https://github.com/LuisMayo/ace-attorney-twitter-bot and using https://github.com/LuisMayo/objection_engine. Currently being executed at https://bsky.app/profile/acecourtbot-jr.bsky.social.

## Getting Started
### Prerequisites 

- Everything included in the [objection_engine prerequisites](https://github.com/LuisMayo/objection_engine/blob/main/README.md#prerequisites)
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

### Alternatively, build and run with Docker:

        docker build -t ace-attorney-bsky-bot .
        docker run ace-attorney-bsky-bot



## Contributing

Since this is a small project there are no strict contribution rules. Open a pull request to fix issues or make improvements. Contributions will be accepted as long as they don't deviate from the project's objectives. Open an issue first if you're unsure whether a change would be accepted.



## License

[ISC](https://opensource.org/license/isc-license-txt)