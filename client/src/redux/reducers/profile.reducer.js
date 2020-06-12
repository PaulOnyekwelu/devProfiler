import { GET_PROFILE, PROFILE_ERROR, CLEAR_PROFILE } from '../constant';


const INITIAL_STATE = {
    profile: null,
    profiles: [],
    repos: [],
    loading: true,
    error: {}
}


const profile = ( state=INITIAL_STATE, action ) => {
    const { type, payload } = action;
    switch(type) {
        case GET_PROFILE:
            return { ...state, profile: payload, loading: false }
        case CLEAR_PROFILE:
            return {...state, profile: null, loading: false, repos: []}
        case PROFILE_ERROR:
            return { ...state, error: payload, loading: false }
        default:
            return state
    }
}

export default profile;