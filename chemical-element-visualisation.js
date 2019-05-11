
import {LitElement, html, svg} from 'lit-element/lit-element';
import chemicalElements from './chemical-elements-data.js'


const SIZE = 500;

class ChemicalElementVisualisation extends LitElement 
{
  constructor()
  {
    super();
    this.symbol = 'he';
  }

  static get properties() 
  {
    return {
      symbol: 
      {
        type: String,
        value: 'he',
      }
    };
  }

  getElementInformation()
  {
    return chemicalElements[this.symbol];
  }

  render() 
  {
    return html`
      <style>

      :host
      {
        width: var(--chemical-element-visualisation-size, 100%);
        display: inline-block;
      }

      .alkali-metal           { fill: var(--alkali-metal-primary-color, #ff8a65);           }
      .alkaline-earth-metal   { fill: var(--alkaline-earth-metal-primary-color, #ffb74d);   }
      .transition-metal       { fill: var(--transition-metal-primary-color, #ffd54f);       }
      .post-transition-metal  { fill: var(--post-transition-metal-primary-color, #dce775);  }
      .metalloid              { fill: var(--metalloid-primary-color, #aed581);              }
      .other-nonmetal         { fill: var(--other-nonmetal-primary-color, #4db6ac);         }
      .halogen                { fill: var(--halogen-primary-color, #4dd0e1);                }
      .noble-gas              { fill: var(--noble-gas-primary-color, #4fc3f7);              }
      .lanthanide             { fill: var(--lanthanide-primary-color, #9575cd);             }
      .actinide               { fill: var(--actinide-primary-color, #f06292);               }

      .ring
      {
        fill: none;
        stroke: #ddd;
      }

      .electron
      {
        fill: #888;
      }

      .electron-background
      {
        fill: var(--chemical-element-visualisation-background-color, #fff);
      }

      #element
      {
        background-color: var(--chemical-element-visualisation-background-color, #fff);
      }

      #electron-group
      {
        animation-name: rotation;
        animation-duration: 10s;          
        animation-timing-function: linear; 
        animation-iteration-count: infinite; 
      }

      @keyframes rotation 
      {
        0%   { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      .s-group-electron { fill: var(--s-group-electron-color, #2196f3); }
      .p-group-electron { fill: var(--p-group-electron-color, #ff9800); }
      .d-group-electron { fill: var(--d-group-electron-color, #4caf50); }
      .f-group-electron { fill: var(--f-group-electron-color, #e91e63); }

      </style>

      <div id="element-container">
        <svg id='element' viewBox="${-SIZE / 2.0} ${-SIZE / 2.0} ${SIZE} ${SIZE}">
          <title>${this._getNameByElementSymbol(this.symbol)}</title>
          <circle cx="0" cy="0" r="${SIZE / 10}" class="${this._getGroupByElementSymbol(this.symbol)}"/>
          <g id="ring-group">
            ${this._getConfigurationByElementSymbol(this.symbol).map((electronConfiguration, index) => svg`

              <circle  
                cx="0" 
                cy="0"
                r=${this._calculateRingRadius(index, this._getConfigurationByElementSymbol(this.symbol).length)}
                opacity="${ index == this._getConfigurationByElementSymbol(this.symbol).length - 1 ? 1.0 : 0.3 }" 
                class="ring"
              />

            `)}
          </g>
          <g id="electron-group">
            ${this._calculateElectrons(this._getConfigurationByElementSymbol(this.symbol))}
          </g>
        </svg>
      </div>
    `;
  }

  _getNameByElementSymbol(symbol)
  {
    if(symbol == undefined) return '';
    if(chemicalElements[symbol] == undefined) return '';

    return chemicalElements[symbol].name;
  }

  _getGroupByElementSymbol(symbol)
  {
    if(symbol == undefined) return '';
    if(chemicalElements[symbol] == undefined) return '';

    return chemicalElements[symbol].group;
  }

  _getConfigurationByElementSymbol(symbol)
  {
    if(symbol == undefined) return [];
    if(chemicalElements[symbol] == undefined) return [];

    return chemicalElements[symbol]["electron-configuration"];
  }

  _calculateElectrons(electronConfiguration)
  {
    const outerShell = electronConfiguration[electronConfiguration.length - 1];
    const secondOuterShell = electronConfiguration[electronConfiguration.length - 2];

    let electrons = [];
    let electronBackgrounds = [];

    const minimumRadius = SIZE / 6.0;
    const maximumRadius = SIZE / 2.0;

    for(let i=0; i < electronConfiguration.length; i++)
    {
      const configuration = electronConfiguration[i];
      const totalValenceElectrons = configuration.s + configuration.p + configuration.d + configuration.f;

      for(let j=0; j < totalValenceElectrons; j++)
      {
        const ringRadius = minimumRadius + (i+1) * (maximumRadius - minimumRadius) / (electronConfiguration.length + 1);
        const phaseShift = i * Math.PI / 8.0;

        const cx = (Math.sin((2 * Math.PI) * (j / totalValenceElectrons) + phaseShift) * ringRadius);
        const cy = (Math.cos((2 * Math.PI) * (j / totalValenceElectrons) + phaseShift) * ringRadius);

        const electronType = this._getElectronType(j, configuration);
        const opacity = this._getOpacity(i, j, configuration, electronConfiguration, outerShell, secondOuterShell);

        const electron = svg` <circle cx="${cx}" cy="${cy}" r="${SIZE / 50.0}" opacity="${opacity}" class="electron ${electronType}" /> `;
        const electronBackground = svg` <circle cx="${cx}" cy="${cy}" r="${SIZE / 50.0 + SIZE / 75.0}" opacity="${opacity}" class="electron-background" /> `;

        electronBackgrounds.push(electronBackground);
        electrons.push(electron);
      }
    }

    return electronBackgrounds.concat(electrons);
  }

  _getElectronType(j, configuration)
  {
    const s = configuration.s;
    const p = configuration.p;
    const d = configuration.d;

    if(j >= s && j >= p + s && j >= d + p + s) return "f-group-electron";
    if(j >= s && j >= p + s) return "d-group-electron";
    if(j >= s) return "p-group-electron";
    return "s-group-electron";
  }

  _getOpacity(i, j, configuration, electronConfiguration, outerShell, secondOuterShell)
  {
    if(j >= configuration.p + configuration.s)
    {
      if(j >= configuration.d + configuration.p + configuration.s)
      {
        if(secondOuterShell.d <= 1 && electronConfiguration.length - i == 3)
        {
          return 1.0;
        }
      }
      else
      {
        if(outerShell.p <= 0 && electronConfiguration.length - i == 2)
        {
          return 1.0;
        }
      }
    }

    if(i === electronConfiguration.length - 1)
    {
      return 1.0;
    }
    else
    {
      return 0.3;
    }
  }

  _calculateRingRadius(ringIndex, amountOfRings)
  {
    const minimumRadius = SIZE / 6.0;
    const maximumRadius = SIZE / 2.0;

    const radius = minimumRadius + (ringIndex + 1) * (maximumRadius - minimumRadius) / (amountOfRings + 1);

    return radius;
  }
}

window.customElements.define('chemical-element-visualisation', ChemicalElementVisualisation);
