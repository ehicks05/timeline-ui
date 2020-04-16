// https://visjs.github.io/vis-timeline/docs/timeline/
import React, {useEffect, useState} from 'react';
import './App.css';
import 'bulma/css/bulma.min.css'
import {DataSet, Timeline} from "vis-timeline/standalone";
import 'vis-timeline/styles/vis-timeline-graph2d.min.css';
import moment from "moment";
import Footer from "./components/Footer";
import Hero from "./components/Hero";
import EventForm from "./EventForm";

function App()
{
    const [timeline, setTimeline] = useState({});
    const [timelineData, setTimelineData] = useState({});
    const [loading, setLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState({start: moment(), end: moment()});

    async function fetchTimeline(userId) {
        const response = await fetch(`/timeline/${userId}`);
        const timelineData = await response.json();
        setTimelineData(timelineData);
        setLoading(false);
        return timelineData;
    }

    async function remove(item) {
        const response = await fetch(`/event/1/${item.id}`, {
            method: 'DELETE',
        });
        return response;
    }

    useEffect(() => {
        const options = {
            width: '100%',
            // height: '100%',
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
            orientation: {axis: 'top', item: 'top'},
            onRemove: (item, callback) => {
                remove(item).then(response => {
                    if (response.status === 200)
                        callback(item);
                    else
                        callback(null);
                });
            },
        }
        
        fetchTimeline(1, options).then(data =>
        {
            let events = data.eventList;
            // DOM element where the Timeline will be attached
            var container = document.getElementById('timelineContainer');

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

            let groups = data.eventGroupList.map(grp => {
                if (grp.nestedGroups.length === 0)
                    delete grp.nestedGroups;

                return grp;
            });

            const itemSet = new DataSet(events);
            const groupSet = new DataSet(groups);

            // Create a Timeline
            let timeline = new Timeline(container, itemSet, groupSet, options);
            setTimeline(timeline);
            console.log(timeline.itemsData.get());

            timeline.on('select', function (properties) {
                const selectedItems = properties.items;
                if (selectedItems)
                    setSelectedEvent(timeline.itemsData.get(selectedItems[0]));
            });
        });
    }, []);

    function toggleAddEventForm()
    {
        document.getElementById('addEventFormContainer').classList.toggle('is-hidden');
        document.querySelector('#toggleAddEventFormButton span i').classList.toggle('fa-plus');
        document.querySelector('#toggleAddEventFormButton span i').classList.toggle('fa-minus');
    }

    if (loading)
        return <Hero title="Loading..." subTitle="Please Wait..."/>;

    return (
        <div className="App">
            <Hero title={timelineData.timeline.title} subTitle={timelineData.timeline.subTitle}/>
            <section className=''>
                <div className='container'>
                    <button title='Zoom Out' className='button' onClick={() => timeline.fit()}>
                        <span className="icon">
                            <i className="fas fa-search-minus"> </i>
                        </span>
                    </button>

                    <div id="timelineContainer" style={{width: '100%'}}> </div>

                    {
                        timeline.groupsData &&
                        <>
                            <button id='toggleAddEventFormButton' title='Add Event' className='button' onClick={toggleAddEventForm}>
                                <span className="icon">
                                    <i className="fas fa-plus"> </i>
                                </span>
                            </button>

                            <EventForm timeline={timeline} event={selectedEvent} />
                        </>
                    }

                </div>
            </section>
            <Footer/>
        </div>
    );
}

export default App;
