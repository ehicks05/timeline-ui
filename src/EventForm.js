import React, {useEffect, useState} from "react";
import moment from "moment";

export default function EventForm(props) {
    const [event, setEvent] = useState(props.event);

    const handleEventChange = (e) => setEvent({
        ...event,
        [e.currentTarget.name]: e.currentTarget.value
    })

    useEffect(() => {
        setEvent(props.event);
    }, [props.event])

    function getNextId() {
        let maxId = 0;
        props.timeline.itemsData.forEach(item =>
        {
            if (item.id > maxId) maxId = item.id;
        });
        return maxId + 1;
    }

    async function saveEvent(e)
    {
        e.preventDefault();

        const id = event.id ? event.id : getNextId();

        const newItem = {
            id: id,
            group: document.querySelector('#group').value,
            content: document.querySelector('#content').value,
            start: document.querySelector('#start').value,
            end: document.querySelector('#end').value,
            current: document.querySelector('#current').value,
            type: document.querySelector('#type').value,
            userId: 1 //todo get userId from state user
        };

        const method = event.id ? 'PUT' : 'POST';
        const response = await fetch("/event/userEvents", {
            method: method,
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(newItem)
        });

        if (response.status === 200) {
            console.log('everything was good');

            if (!event.id)
            {
                props.timeline.itemsData.add(newItem);
            }
            else
                props.timeline.itemsData.update(newItem);
        }
        else {
            //todo make error message that something failed
            //put error message in response
        }
    }

    return (
        <div className='box is-hidden' id='addEventFormContainer'>
            <p className="subtitle">{event.id ? 'Update' : 'Add'} Event</p>
            <form id='newEvent' name='newEvent' onSubmit={saveEvent}>
                <div className="field">
                    <div className="control">
                        <div className="select is-small">
                            <select id='group' name='group' value={event.group} onChange={handleEventChange}>
                                <option value="">Group</option>
                                {
                                    props.timeline.groupsData.get().map(group =>
                                        <option key={group.id} value={group.id}>{group.content}</option>)
                                }
                            </select>
                        </div>
                    </div>
                </div>
                <div className="field">
                    <div className="control">
                        <input className="input is-small" type="text" id='content' name='content' placeholder="Content" value={event.content} onChange={handleEventChange}/>
                    </div>
                </div>
                <div className="field">
                    <label className="label is-small" htmlFor='start'>Start</label>
                    <div className="control">
                        <input className="input is-small" type="date" id='start' name='start' value={moment(event.start).format('YYYY-MM-DD')}
                               onChange={handleEventChange}/>
                    </div>
                </div>
                <div className="field">
                    <label className="label is-small" htmlFor='end'>End</label>
                    <div className="control">
                        <input className="input is-small" type="date" id='end' name='end' value={moment(event.end).format('YYYY-MM-DD')}
                               onChange={handleEventChange}/>
                    </div>
                </div>
                <label className='checkbox' htmlFor='current'>
                    <input type="checkbox" id='current' name='current' checked={event.current} onChange={handleEventChange}/>
                    &nbsp;Is Current
                </label>
                <br/>
                <div className="field">
                    <label className="label is-small" htmlFor='type'>Type</label>
                    <div className="control">
                        <div className="select is-small">
                            <select id='type' name='type' value={event.type} onChange={handleEventChange}>
                                <option value='box'>Box</option>
                                <option value='point'>Point</option>
                                <option value='range'>Range</option>
                                <option value='background'>Background</option>
                            </select>
                        </div>
                    </div>
                </div>
                <button className='button is-small is-primary'>
                    {event.id ? 'Save' : 'Add'}
                </button>
            </form>
        </div>
    );
}