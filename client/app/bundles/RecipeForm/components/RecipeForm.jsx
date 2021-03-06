import PropTypes from 'prop-types';
import React from 'react';
import BrewCalc from '../lib/BrewCalcs';
import RecipeMetaPanel from './RecipeMetaPanel';
import RecipeStyle from './RecipeStyle';
import Malt from './Malt';
import VolumeAndEfficiency from './VolumeAndEfficiency';
import IngredientList from './IngredientList';
import Utils from '../lib/Utils';
import update from 'immutability-helper';

export default class RecipeForm extends React.Component {
  constructor(props) {
    super(props);
    this.updateCalcs = this.updateCalcs.bind(this);

    var recipe = JSON.parse(this.props.recipe);
    recipe.fgArray = BrewCalc.parseFg(recipe.FG || '0');
    recipe.abv = BrewCalc.getAbv(recipe.OG || 1, recipe.fgArray);
    recipe.malts = this.props.malts || [];
    recipe.hops = this.props.hops || [];
    recipe.yeasts = this.props.yeasts || [];

    this.state = recipe;
  }

  //handles state changes provided by child components,
  //then updates prediction calcs.
  childCallback(data = {}) {
    //should put some logic in the decision to run updateCalcs.
    this.setState(data, this.updateCalcs);
  }

  //handles interanal state changes
  handleChange(change) {
    this.setState(change);
  }

  updateCalcs() {
    Utils.buildIngredientMeta('malts', this.state.malts, malts => {
      this.maltCalcs(malts);
    });
  }

  maltCalcs(malts) {
    let efficiency = (this.state.efficiency || this.props.userPref.efficiency) / 100;
    //batch volume in gallons (malt calcs all rely on imperial units)
    let batchVolume = BrewCalc.unitConverter['L']['G'](this.state.batch_volume);

    let og = BrewCalc.calcOg(malts, batchVolume, efficiency);
    let fgArray = BrewCalc.parseFg(this.state.FG || '0');
    let abv = BrewCalc.getAbv(og, fgArray);
    let mcu = BrewCalc.calcMcu(malts, batchVolume);
    let srm = BrewCalc.calcBeerSrm(mcu);

    this.setState(
      {
        fgArray: fgArray,
        abv: abv,
        OG: og,
        colour: srm
      },
      () => {
        Utils.buildIngredientMeta('hops', this.state.hops, hops => {
        this.hopsCalcs(hops);
      });
    });
  }

  hopsCalcs(hops) {
    let totalIbu = BrewCalc.getTotalIbu(hops, this.state.OG, this.state.batch_volume);

    this.setState({IBU: totalIbu});
  }

  componentWillMount() {
    this.updateCalcs();
  }

  render() {
    let malts = this.state.malts;
    let hops = this.state.hops;
    let og = this.state.OG;
    let batchVolume = this.state.batch_volume;
    let userPref = this.props.userPref;

    return (
      <div>

        <div>
          <label htmlFor="name">Recipe Name:</label>
          <input
            id="name"
            onChange={ e => this.handleChange({name: e.target.value}) }
            value={ this.state.name }>
          </input>
        </div>

        <RecipeStyle
          styles={ this.props.styles }
          selected={ this.state.style }
          parentCallback={ data => this.childCallback(data) }>
        </RecipeStyle>

        <RecipeMetaPanel
          recipe={ this.state }
          parentCallback={ data => this.childCallback(data) }>
        </RecipeMetaPanel>

        <VolumeAndEfficiency
          userPref={ userPref }
          volume={ this.props.batch_volume || this.props.userPref.default_batch_volume }
          efficiency={ this.props.efficiency || this.props.userPref.default_efficiency }
          parentCallback={ data => this.childCallback(data) }>
        </VolumeAndEfficiency>

        <br />

        <IngredientList
          type='malt'
          ingredients={ malts }
          rawOptions={ this.props.ingredientOptions.malts }
          parentCallback={ data => this.childCallback(data) }
          userPref={ userPref }
          contributions={ BrewCalc.getMaltContributions(malts) }>
        </IngredientList>

        <br />

        <IngredientList
          type='hop'
          ingredients={ hops }
          rawOptions={ this.props.ingredientOptions.hops }
          parentCallback={ data => this.childCallback(data) }
          userPref={ userPref }
          contributions={ BrewCalc.getHopContributions(hops, og, batchVolume) }>
        </IngredientList>

        <br />

        <IngredientList
          type='yeast'
          ingredients={ this.state.yeasts }
          rawOptions={ this.props.ingredientOptions.yeasts }
          parentCallback={ data => this.childCallback(data) }>
        </IngredientList>

        <br />

        <div className="method field">
          <label htmlFor="method">Method:</label>
          <textarea
            id="method"
            onChange={ e => this.handleChange({method: e.target.value}) }
            value={ this.state.method }>
          </textarea>
        </div>

      </div>
    );
  }
}
