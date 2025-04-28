# CalmBrowse Browser Extension

CalmBrowse is a Chrome extension designed to provide just-in-time, evidence-based support for individuals experiencing cyberchondria and health anxiety.

## Features

The current version includes the Perspective Panel feature, which:

- Detects when you're browsing health-related websites
- Provides context about condition prevalence and typical outcomes
- Offers evidence-based reframing of health information
- Links to trusted health information sources
- Appears as a non-intrusive, dismissible panel

## Installation (Development Mode)

Since this extension isn't published on the Chrome Web Store yet, you'll need to install it in developer mode:

1. Download or clone this repository to your local machine
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" using the toggle in the top-right corner
4. Click "Load unpacked" and select the directory containing this extension
5. The extension should now be installed and active

## How It Works

When you visit a health-related website (such as WebMD, Mayo Clinic, or Healthline), the extension will:

1. Analyze the page content to identify health-related keywords
2. Display a panel with:
   - Base rate information about condition prevalence
   - Context about typical outcomes
   - A reframing statement to help provide perspective
   - Links to trusted health information sources

The panel can be dismissed at any time by clicking the close button.

## Supported Websites

The extension currently works on:
- webmd.com
- mayoclinic.org
- healthline.com
- medicinenet.com

## Project Status

This is an early prototype focusing only on the Perspective Panel component. Future versions will include additional features such as:

- CalmRing Timer & Break Nudges
- Guided Breathing Overlay
- CBT Micro-Coach
- "Soften Image" Feature

## Privacy

The extension:
- Does not collect or transmit any personal data
- All processing happens locally in your browser

## License

[MIT License](LICENSE) 