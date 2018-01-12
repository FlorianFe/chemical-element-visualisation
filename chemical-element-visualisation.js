
class ChemicalElementVisualisation extends Polymer.Element
{
  static get is()
  {
    return 'chemical-element-visualisation';
  }

  static get properties()
  {
    return {
      symbol: String,
      tooltip:
      {
        type: Boolean,
        value: false
      },
      _elements: Object,
      _element: Object
    }
  }

  static get observers()
  {
    return [
      '_onSymbolChange(symbol, _elements)',
      '_onElementChange(_element, _elements)'
    ];
  }

  constructor()
  {
    super();

    this._loadJSON(this.resolveUrl('chemical-elements.json'), (data) => this._elements = data );
  }

  _onSymbolChange()
  {
    if(this.symbol && this._elements)
    {
      this._element = this._elements[this.symbol];
    }
  }

  _onElementChange()
  {
    const SIZE = 500;

    let dynamicallyAddedElements = this.shadowRoot.querySelectorAll(".added-dynamically");
    dynamicallyAddedElements.forEach((element) => element.remove() );

    if(this._element && this._elements)
    {
      let electronConfiguration = this._element["electron-configuration"];
      let electronGroup = this.$["electron-group"];
      let ringGroup = this.$["ring-group"];

      let minimumRadius = SIZE / 6;
      let maximumRadius = SIZE / 2;

      for(let i=0; i < electronConfiguration.length; i++)
      {
        let ring = document.createElementNS("http://www.w3.org/2000/svg", "circle");

        let radius = minimumRadius + (i+1) * (maximumRadius - minimumRadius) / (electronConfiguration.length + 1);

        ring.setAttribute("cx", SIZE / 2);
        ring.setAttribute("cy", SIZE / 2);
        ring.setAttribute("r", radius);
        ring.classList.add("ring");
        ring.classList.add("added-dynamically");

        if(i !== electronConfiguration.length - 1)
        {
          ring.setAttribute("opacity", "0.3");
        }

        ringGroup.appendChild(ring);
      }

      let outerShell = electronConfiguration[electronConfiguration.length - 1];
      let secondOuterShell = electronConfiguration[electronConfiguration.length - 2];

      let electrons = [];
      let electronBackgrounds = [];

      for(let i=0; i < electronConfiguration.length; i++)
      {
        let configuration = electronConfiguration[i];
        let totalValenceElectrons = configuration.s + configuration.p + configuration.d + configuration.f;

        for(let j=0; j < totalValenceElectrons; j++)
        {
          let electron = document.createElementNS("http://www.w3.org/2000/svg", "circle");
          let electronBackground = document.createElementNS("http://www.w3.org/2000/svg", "circle");

          let ringRadius = minimumRadius + (i+1) * (maximumRadius - minimumRadius) / (electronConfiguration.length + 1);
          let phaseShift = i * Math.PI/8;

          let cx = (Math.sin((2 * Math.PI) * (j / totalValenceElectrons) + phaseShift) * ringRadius);
          let cy = (Math.cos((2 * Math.PI) * (j / totalValenceElectrons) + phaseShift) * ringRadius);
          let radius = SIZE / 50;

          electron.setAttribute("cx", cx);
          electron.setAttribute("cy", cy);
          electron.setAttribute("r", radius);
          electron.setAttribute("opacity", "0.3");
          electron.classList.add("electron");
          electron.classList.add("added-dynamically");

          electronBackground.setAttribute("cx", cx);
          electronBackground.setAttribute("cy", cy);
          electronBackground.setAttribute("r", radius + SIZE / 75);
          electronBackground.classList.add("electron-background");
          electronBackground.classList.add("added-dynamically");

          if(j >= configuration.s)
          {
            if(j >= configuration.p + configuration.s)
            {
              if(j >= configuration.d + configuration.p + configuration.s)
              {
                electron.classList.add("f-group-electron");

                if(secondOuterShell.d <= 1 && electronConfiguration.length - i == 3)
                  electron.setAttribute("opacity", "1");
              }
              else
              {
                electron.classList.add("d-group-electron");

                if(outerShell.p <= 0 && electronConfiguration.length - i == 2)
                  electron.setAttribute("opacity", "1");
              }
            }
            else
            {
              electron.classList.add("p-group-electron");
            }
          }
          else
          {
            electron.classList.add("s-group-electron");
          }

          if(i === electronConfiguration.length - 1)
          {
            electron.setAttribute("opacity", "1");
          }

          electronBackgrounds.push(electronBackground);
          electrons.push(electron);
        }
      }

      electronBackgrounds.forEach((electronBackground) => electronGroup.appendChild(electronBackground));
      electrons.forEach((electron) => electronGroup.appendChild(electron));

      electronGroup.animate(
      [
        { "transform" : "translate(" + (SIZE / 2) + "px, " + (SIZE / 2) + "px) rotate(0deg)"},
        { "transform" : "translate(" + (SIZE / 2) + "px, " + (SIZE / 2) + "px) rotate(360deg)"}
      ],
      {
        duration: 10000,
        iterations: Infinity
      });
    }
  }

  _loadJSON(path, success, error)
  {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function()
    {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                if (success)
                    success(JSON.parse(xhr.responseText));
            } else {
                if (error)
                    error(xhr);
            }
        }
    };
    xhr.open("GET", path, true);
    xhr.send();
  }

  _divide(divident, divisor)
  {
    return (divident / divisor);
  }
}

customElements.define(ChemicalElementVisualisation.is, ChemicalElementVisualisation);
