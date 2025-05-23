import React, {useCallback, useEffect, useRef, useState} from 'react';
import {connect} from 'react-redux';
import CanvasContext from './CanvasContext';
import { update } from './slices/allCharactersSlice';
import { moveMyCharacterTo } from './characterConstants';
import {MOVE_DIRECTIONS, MAP_DIMENSIONS, TILE_SIZE} from './mapConstants';
import { MY_CHARACTER_INIT_CONFIG } from './characterConstants';
import {checkMapCollision} from './utils';
import { useDispatch } from 'react-redux';

const GameLoop = ({children, allCharactersData}) => {
    const canvasRef = useRef(null);
    const [context, setContext] = useState(null);
    useEffect(() => {
        console.log("initial setContext");
        setContext({canvas: canvasRef.current.getContext('2d'), frameCount: 0});
    }, [setContext]);

    const loopRef = useRef();
    const dispatch = useDispatch();
    const myCharacterData = allCharactersData[MY_CHARACTER_INIT_CONFIG.id];

    const moveMyCharacter = useCallback((e) => {
        var currentPosition = myCharacterData.position;
        const key = e.key.toLowerCase();
        if(!MOVE_DIRECTIONS[key]) {
            return;
        }

        if(MOVE_DIRECTIONS[key]) {
            const [dx, dy] = MOVE_DIRECTIONS[key];
            const newPosition = {
                x: currentPosition.x + dx,
                y: currentPosition.y + dy,
            };

            if(checkMapCollision(newPosition.x, newPosition.y)) {
                console.log("Blocked by wall or out of bounds!");
                return;
            }

            dispatch(update({
                ...allCharactersData,
                [MY_CHARACTER_INIT_CONFIG.id]: {
                    ...myCharacterData,
                    position: newPosition
                }
            }));
            
            moveMyCharacterTo(newPosition.x, newPosition.y);
        }
    }, [myCharacterData, allCharactersData, dispatch]);

    const tick = useCallback(() => {
        if (context != null) {
            setContext({canvas: context.canvas, frameCount: (context.frameCount + 1) % 60});
        }
        loopRef.current = requestAnimationFrame(tick);
    }, [context]);

    useEffect(() => {   
        loopRef.current = requestAnimationFrame(tick);
        return () => {
            loopRef.current && cancelAnimationFrame(loopRef.current);
        }
    }, [loopRef, tick])

    useEffect(() => {
        document.addEventListener('keypress', moveMyCharacter);
        return () => {
            document.removeEventListener('keypress', moveMyCharacter);
        }
    }, [moveMyCharacter]);

    return (
        <CanvasContext.Provider value={context}>
            <canvas
                ref={canvasRef} 
                width={TILE_SIZE * MAP_DIMENSIONS.COLS}
                height={TILE_SIZE * MAP_DIMENSIONS.ROWS}
                class="main-canvas"
            />
            {children}
        </CanvasContext.Provider>
    );
};

const mapStateToProps = (state) => {
    return {allCharactersData: state.allCharacters.users};
};

export default connect(mapStateToProps, {})(GameLoop);
