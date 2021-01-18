import React, {createContext, useContext, useEffect, useReducer} from 'react';

const PageStateContext = createContext({});
const PageActionsContext = createContext({});

export const PageContextProvider = ({ws, children}) => {
    const reducer = (state, action) => {
        switch (action.type) {
            case 'productsFetched' :
                return {
                    ...state,
                    products: action.payload.map((name) => ({name, checked: false}))
                };
            case 'updatePrices' :
                const prices = {...state.prices, [action.payload.name]: action.payload.prices};
                return {
                    ...state,
                    prices
                }
            case 'price_update' :
                let storedPrices = state.prices[action.payload.name];
                storedPrices.push({time: action.payload.time, price: action.payload.price})
                return {
                    ...state,
                    prices: {...state.prices, [action.payload.name] : storedPrices}
                }
            case 'checkProduct' :
                const products = state.products.map((product) => {
                    if (product.name === action.payload.name) {
                        return action.payload
                    } else {
                        return product
                    }
                });
                return {
                    ...state,
                    products
                }
            default: return state
        }
    }

    const [state, dispatch] = useReducer(reducer, {
        products: [],
        prices: {}
    });

    useEffect(() => {
        if (!ws) return;
        ws.onmessage = evt => {
            const message = JSON.parse(evt.data)
            switch (message.type) {
                case 'subscribed':
                    dispatch({type: 'updatePrices', payload : {name: message.product_id, prices: message.prices}});
                    break;
                case 'price_changed' :
                    dispatch({type: 'price_update', payload : {
                        name: message.product_id,
                        time: message.time,
                        price: message.price
                    }});
                    break;
                default: return
            }
        }
        ws.onopen = () => {
            state.products.filter(({checked}) => checked).forEach(({name}) => {
                ws.send(JSON.stringify({
                    method: "subscribe",
                    params: {product_id: name}
                }))
            })
        }
    }, [ws]) // eslint-disable-line

    const checkProduct = (params) => {
        if (ws.readyState===1) {
            ws.send(JSON.stringify({
                method: params.checked ? "subscribe" : "unsubscribe",
                params: {product_id: params.name}
            }))
        }
        dispatch({type: 'checkProduct', payload: params})
    }
    const fetchProducts = () => {
        fetch('/api/products').then(async (data) => {
            const payload = await data.json();
            dispatch({type: 'productsFetched', payload})
        })
    }

    useEffect(() => {
        fetchProducts()
    }, []);

    const updatePrices = (params) => {
        dispatch({type: 'updatePrices', payload: params})
    }

    const actions = {
        checkProduct,
        updatePrices
    }
    return (
        <PageStateContext.Provider value={state}>
            <PageActionsContext.Provider value={actions}>
                {children}
            </PageActionsContext.Provider>
        </PageStateContext.Provider>
    )
}

export default PageContextProvider;

export function useContextState() {
    return useContext(PageStateContext)
}

export function useContextActions() {
    return useContext(PageActionsContext)
}
