var timer = 
{
	installTimeInSeconds  : 100,
    currentTimeInSeconds  : 0,

    runCallBack           : null,
    endCallBack           : null,

    running               : false,
    interval              : 1000,
    
    init : function (interval)
    {
		this.installTimeInSeconds = 100;
		this.currentTimeInSeconds = this.installTimeInSeconds;
		this.interval = interval;
    },
    
    run: function()
    {
        this.currentTimeInSeconds = this.currentTimeInSeconds - 1;
        if (this.runCallBack != null)
        	this.runCallBack();
        if (this.isFinished())
        {
            this.stop();
            return;
        }
    },
    
    isFinished: function()
    {
        if ( this.currentTimeInSeconds <= 0 )
            return true;
        return false;
    },
    
    setRunCallBack: function (fn)
    {
        this.runCallBack = fn;
    },

    setEndCallBack: function (fn)
    {
        this.endCallBack = fn;
    },

    setTimeInSeconds: function(seconds, interval)
    {
    	this.currentTimeInSeconds = this.installTimeInSeconds - seconds;
    	this.interval             = interval;
    },
    start: function()
    {
        Ext.TaskMgr.start (this);
        this.running = true;
    }, 
    
    stop: function()
    {
        if (this.running)
        {
            Ext.TaskMgr.stop( this );
            this.running = false;
			if (this.endCallBack != null)
				this.endCallBack();
        }
    },
    
    isRunning : function()
    {
        return this.running;
    }
};
