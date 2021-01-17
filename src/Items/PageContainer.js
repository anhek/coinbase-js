import React from "react";
import {Resizable, Charts, ChartContainer, ChartRow, YAxis, LineChart, Baseline} from "react-timeseries-charts";
import { TimeSeries } from "pondjs";
import {Button, Grid} from "@material-ui/core";
import {useContextActions, useContextState} from "./PageContext";

const style = {
    value: {
        stroke: "#a02c2c",
        opacity: 0.8
    }
};

const axisStyle = {
    labels: { labelColor: "Red", labelWeight: 40, labelSize: 10 },
    axis: { axisColor: "Orange" }
};


export const PageContainer = () => {
    const state = useContextState();
    const actions = useContextActions();
    return (
        <div>
            <h1>Coinbase</h1>
            <div style={{margin: '12px'}}>
                <CheckProductContainer
                    products={state.products}
                    checkProduct={actions.checkProduct}
                />
                <Grid container spacing={4}>
                    {state.products.filter(({checked}) => checked).map(({name}) => {
                        // console.log(state.prices[name]);
                        return (
                            <Grid item key={'product-'+name} xs={4}>
                                <ProductContainer name={name} prices={state.prices[name]} updatePrices={(prices) => actions.updatePrices({name, prices})}/>
                            </Grid>
                        )
                    })}
                </Grid>
            </div>
        </div>
    )
};

export default PageContainer;

export const CheckProductContainer = ({products, checkProduct}) => {
    return (
        <div>
            <Grid container spacing={1}>
            {products.map(({name, checked}) => (
                <Grid item key={'check-product-'+name}>
                <Button
                    style={{width: '130px'}}
                    label={name}
                    variant={checked ? "contained" : "outlined"}
                    onClick={() => checkProduct({name, checked: !checked})}
                >
                    {name}
                </Button>
                </Grid>
            ))}
            </Grid>
        </div>
    )
}

export const ProductContainer = ({name, prices = []}) => {
    const points = prices.map(({time, price}) =>
        [new Date(time).getTime(), parseFloat(price)]
    );
    const precision = Math.max(...prices.map(({price}) => price.split(".")[1] ? price.split(".")[1].length : 0))
    const state = {
        name: "Price",
        columns: ["time", "value"],
        points,
        precision
    };
    if (state.points.length === 0) return null;
    const series = new TimeSeries(state);
    return (
        <div>
            <div>
                <h2>{name}</h2>
                Last price: {state.points[state.points.length-1][1]}
            </div>
            <Resizable>
                <ChartContainer timeRange={series.range()} timeAxisStyle={axisStyle} format="%H:%M:%S">
                    <ChartRow height="160">
                        <YAxis
                            id="price"
                            style={axisStyle}
                            min={series.min()}
                            max={series.max()}
                            width="90"
                            format={",."+state.precision+"f"}
                        />
                        <Charts>
                            <LineChart axis="price" series={series} style={style} interpolation="curveBasis"/>
                            <Baseline axis="price" value={series.max()} label="Max" position="right"/>
                            <Baseline axis="price" value={series.min()} label="Min" position="right"/>
                            <Baseline axis="price" value={series.avg()} label="Avg" position="right"/>
                        </Charts>
                    </ChartRow>
                </ChartContainer>
            </Resizable>
        </div>
    )
}