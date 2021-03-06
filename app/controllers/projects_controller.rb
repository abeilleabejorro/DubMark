class ProjectsController < ApplicationController
  # GET /projects
  # GET /projects.json
  def index 
    #provide an initial splash page, and don't let mongo load the everything...
    @projects = nil

    conditions = {} #Better filter methods?  This seems dumb
    if params[:title] and !params[:title].empty?
      conditions[:title] = { "$regex" => params[:title], "$options" => "-i" } 
    end
    if params[:state] and !params[:state].empty?
      conditions[:state] = { "$regex" => params[:state], "$options" => "-i" } 
    end

    #Pagination... but how do I get a count back without looking up the count?
    @projects = Project.paginate(
      :conditions => conditions,
      :per_page => params[:per_page] ? params[:per_page].to_i : 100,
      :page     => params[:page]     ? params[:page].to_i     : 0,
      :order    => 'id dsc'
    )
    respond_to do |format|
      format.html # index.html.erb
      format.json { render json: @projects }
    end 
  end

  # GET /projects/1
  # GET /projects/1.json
  def show
    @project = Project.find(params[:id])

    respond_to do |format|
      format.html # show.html.erb
      format.json { render json: @project }
    end
  end

  # GET /projects/new
  # GET /projects/new.json
  def new
    @project = Project.new

    respond_to do |format|
      format.html # new.html.erb
      format.json { render json: @project }
    end
  end

  # GET /projects/1/edit
  def edit
    @project = Project.find(params[:id])
  end

  # POST /projects
  # POST /projects.json
  def create
    @project = Project.new(params[:project])

    respond_to do |format|
      if @project.save
        format.html { redirect_to @project, notice: 'Project was successfully created.' }
        format.json { render json: @project, status: :created, location: @project }
      else
        format.html { render action: "new" }
        format.json { render json: @project.errors, status: :unprocessable_entity }
      end
    end
  end

  def format
    @subs = nil;
    if(params[:id])
      @subs = Sub.all(:conditions => {:projectId => params[:id]})
    else
      throw "Error, you must provide a projectId"
    end
    @subs = @subs.sort_by{|k| k['sTime'].to_d}
     
    format = 'webvtt'
    if(!params[:format] or (params[:format] == 'webvtt'))
      @output = format_web_vtt(@subs)
      if(!params[:debug])
         send_data "#{@output}", :filename => 'subs.vtt'
         return
      end
    end
  end

  def format_ass(subs)
    return ''
  end

  def format_web_vtt(subs)
    output = "WEBVTT\n\n"
    @subs.each{ |sub|
      trans = sub['trans'] ? sub['trans'].to_s : nil
      if(trans != nil)
        output += sub.sTime + " --> " + sub.eTime + "\n"
        output += trans + "\n\n"
      end
    }
    return output
  end

  # PUT /projects/1
  # PUT /projects/1.json
  def update
    @project = Project.find(params[:id])

    respond_to do |format|
      if @project.update_attributes(params[:project])
        format.html { redirect_to @project, notice: 'Project was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: "edit" }
        format.json { render json: @project.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /projects/1
  # DELETE /projects/1.json
  def destroy
    @project = Project.find(params[:id])
    @project.destroy

    respond_to do |format|
      format.html { redirect_to projects_url }
      format.json { head :no_content }
    end
  end
end
