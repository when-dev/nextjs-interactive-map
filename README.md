# 3D Building Map Application

This project is an interactive map application built with Next.js, TailwindCSS, and ShadCN UI components.

## Overview

This application displays a 3D map of buildings using Mapbox GL. It allows users to interact with 
buildings, view information about selected buildings, and modify the height of selected buildings. 
The app includes a user interface for increasing and resetting the height of buildings.

## Features

- 3D Building Visualization: Renders 3D buildings on the map using Mapbox GL.
- Building Selection: Allows users to select buildings and view information about them.
- Height Adjustment: Increase the height of the selected building and reset it to its original height.
- Map Customization: Hide Mapbox logo and attribution for a cleaner interface.

## Getting Started
### Prerequisites

* Node.js (v14 or later)
* npm (v6 or later)
* Mapbox Access Token

### Installation
1. Clone the Repository: 
    `git clone https://github.com/when-dev/nextjs-interactive-map.git`
    `cd nextjs-interactive-map`
2. Install Dependencies:
    `npm install`

3. Configure Mapbox:
- Create a .env.local file in the root of your project.
- Add your Mapbox Access Token:
    `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token`

### Running the Application
To start the application in development mode, use:
`npm run dev`
This will start the development server and open the application in your default web browser.

### Building and Deploying
To build the application for production, use:
    `npm run build`
To start the production server locally, use:
    `npm start`

