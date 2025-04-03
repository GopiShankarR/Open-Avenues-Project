import React from 'react';
import { connect } from 'react-redux';
import OtherCharacter from './OtherCharacter';
import { MY_CHARACTER_INIT_CONFIG } from './characterConstants';

const OtherCharacters = ({ allCharactersData }) => {
  return (
    <>
      {Object.values(allCharactersData).map((character) => {
        if (character.id === MY_CHARACTER_INIT_CONFIG.id) return null;
        return <OtherCharacter key={character.id} character={character} />;
      })}
    </>
  );
};

const mapStateToProps = (state) => ({
  allCharactersData: state.allCharacters.users,
});

export default connect(mapStateToProps)(OtherCharacters);