// https://visjs.github.io/vis-timeline/docs/timeline/
import React, {useEffect, useState} from 'react';
import './App.css';
import 'bulma/css/bulma.min.css'
import {DataSet, Timeline} from "vis-timeline/standalone";
import 'vis-timeline/styles/vis-timeline-graph2d.min.css';
import moment from "moment";
import Footer from "./components/Footer";
import Hero from "./components/Hero";

function App()
{
    const [options, setOptions] = useState();
    const [container, setContainer] = useState({});
    const [timeline, setTimeline] = useState({});

    useEffect(() => {
        const options = {
            width: '100%',
            height: '100%',
            editable: true,
            stack: true,
            showMajorLabels: true,
            showCurrentTime: true,
            clickToUse: true,
            zoomMin: 7 * 24 * 60 * 60 * 1000, // width of timeline = 1 week
            type: 'background',
            format: {
                minorLabels: {
                    minute: 'h:mma',
                    hour: 'ha'
                }
            },
            groupOrder: 'id',
            order: function (a, b) {
                return b.start - a.start;
            },
            tooltipOnItemUpdateTime: true,
            orientation: {axis: 'top', item: 'top'}
        };
        setOptions(options);

        // DOM element where the Timeline will be attached
        var container = document.getElementById('visualization');

        fetch("/event/userEvents/1")
            .then(res => {
                return res.json();
            }).then((data) => {
            console.log(data);
            let events = data.userEvents;

            const starts = events.map(item => moment(item.start));
            const ends = events.filter(item => item.end).map(item => moment(item.end));

            const firstDate = moment.min(starts);
            const lastDate = moment.max(moment.max(ends), moment());

            options.start = firstDate.subtract(1, 'year');
            options.end = lastDate.add(1, 'year');

            options.min = firstDate.subtract(1, 'year');
            options.max = lastDate.add(1, 'year');

            // set end date on 'current' events
            events = events.map(event => {
                if (event.current)
                    event.end = new Date();
                return event;
            });

            events = events.map(item => {
                item.title = item.start;
                if (item.end != null) item.title += ' - ' + item.end;
                return item;
            });

            let groups = data.userEventGroups.map(grp => {
                if (grp.nestedGroups.length === 0)
                    delete grp.nestedGroups;

                return grp;
            });

            const itemSet = new DataSet(events);
            const groupSet = new DataSet(groups);

            // Create a Timeline
            let timeline = new Timeline(container, itemSet, groupSet, options);
            setTimeline(timeline);
            setContainer(container);
        });
    }, []);

    function addItem(e) {
        e.preventDefault();
        let maxId = 0;
        timeline.itemsData.forEach(item => {
            if (item.id > maxId) maxId = item.id;
        });
        const newId = maxId + 1;
        const newItem = {
            id: newId,
            group: document.querySelector('#group').value,
            content: document.querySelector('#content').value,
            start: document.querySelector('#start').value,
            end: document.querySelector('#end').value,
            current: document.querySelector('#current').value,
            type: document.querySelector('#type').value,
        };

        timeline.itemsData.add(newItem);
        document.querySelector('#newEvent').reset();
    }

    return (
        <div className="App">
            <Hero/>
            <section className=''>
                <div className='container'>
                    <div className='buttons'>
                        <button title='Zoom Out' className='button' onClick={() => timeline.fit()}>
                            <span className="icon">
                                <i className="fas fa-search-minus"> </i>
                            </span>
                        </button>
                        <button className='button' onClick={() => {
                            const itemData = timeline.itemsData.get(3);
                            if (moment(itemData.start).isSame(moment('1989-01-01')))
                                itemData.start = moment('1984-01-01');
                            else
                                itemData.start = moment('1989-01-01');
                            timeline.itemsData.update(itemData);
                        }}>Toggle Born Date</button>
                        <button className='button' onClick={() => {
                            timeline.addCustomTime('1987-07-25', '123');
                            timeline.setCustomTimeMarker('1987-07-25', '123', true);
                            timeline.setCustomTimeTitle('1987-07-25', '123', true);
                        }}>Add Custom Time Bar</button>

                    </div>
                    <div id="visualization" style={{width: '100%', height: '600px'}}> </div>

                    <form id='newEvent' name='newEvent' onSubmit={addItem}>
                        <label htmlFor='group'>Group</label> <input type="text" id='group' name='group' />
                        <label htmlFor='content'>Content</label> <input type="text" id='content' name='content' />
                        <label htmlFor='start'>Start</label> <input type="date" id='start' name='start' defaultValue='2020-01-01' />
                        <label htmlFor='end'>End</label> <input type="date" id='end' name='end' defaultValue='2020-01-01' />
                        <label htmlFor='current'>Current</label> <input type="checkbox" id='current' name='current' />
                        <label htmlFor='type'>Type</label> <input type="text" id='type' name='type' />
                    <button className='button'>Add</button>
                    </form>
                </div>
            </section>
            <Footer/>
        </div>
    );
}

export default App;
