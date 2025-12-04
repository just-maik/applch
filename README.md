# Intro
Brainrot Vibecode CLI for checking applications with AI

> BUN ONLY FOR NOW!


# Setup

Mandatory:
- Add your Perplexity API Key to the .env file

Optional:
- Create a config.json to configure models and search type

This is the default config that can be overwritten by a config.json in the current working directory
```json
{
    "checkModel": "sonar-reasoning-pro",
    "checkProSearch": false,
    "arenaModel": "sonar-reasoning-pro",
    "arenaProSearch": false,
}
```
- Create a `REQUIREMENTS.md` to write down requirements that are piped int othe prompts

# Usage

1. `bunx applch` for initial setup **or** `bunx applch bootstrap "Name1","Name2"...` to setup with names.json

2. add applicant names to names.json (skip if used boostrap in step 1) and run `bunx applch bootstrap`

3. add applicants documents (Application, CV) to their respective folder in `/data`

- run `bunx applch check` to check all applicants in names.json **or** specify names to check `bunx applch check "Name 1","Name 2"`

- run `bunx applch arena` to create an overall report **or** specify names to include `bunx applch arena "Name 1","Name 2"`

- run `bunx clear` to reset folders for new round

### Results will be saved in the results folder 🤯